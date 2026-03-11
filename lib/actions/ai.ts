'use server';

import prisma from '@/lib/prisma';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { TransactionInput } from '@/lib/types';
import { getTransactionRules } from './transactions';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function matchTransactionsWithRules(
  txList: TransactionInput[],
  householdId: string,
  year?: number
) {
  const targetYear = year || new Date().getFullYear();
  const [savedRules, allSubcategories] = await Promise.all([
    getTransactionRules(householdId),
    prisma.subcategory.findMany({
      where: { householdId, year: targetYear },
      include: { category: true }
    })
  ]);

  return txList.map((tx) => {
    const currentId = tx.subcategoryId || null;
    const dateParts =
      typeof tx.date === 'string'
        ? tx.date.split('-')
        : [
            tx.date.getFullYear().toString(),
            (tx.date.getMonth() + 1).toString(),
            tx.date.getDate().toString()
          ];
    const txMonth = parseInt(dateParts[1], 10);

    const foundRule = savedRules.find((rule) =>
      tx.description.toUpperCase().includes(rule.pattern.toUpperCase())
    );

    if (foundRule) {
      const targetSub = allSubcategories.find(
        (s) =>
          s.name === foundRule.subcategory.name &&
          s.month === txMonth &&
          s.categoryId === foundRule.subcategory.categoryId
      );
      if (targetSub)
        return {
          ...tx,
          subcategoryId: targetSub.id,
          ruleMatched: true,
          pattern: foundRule.pattern
        };
    }

    if (currentId) {
      const aiPickedSub = allSubcategories.find((s) => s.id === currentId);
      if (aiPickedSub) {
        const targetSub = allSubcategories.find(
          (s) =>
            s.name === aiPickedSub.name &&
            s.month === txMonth &&
            s.categoryId === aiPickedSub.categoryId
        );
        if (targetSub) return { ...tx, subcategoryId: targetSub.id };
      }
    }

    return { ...tx, subcategoryId: currentId };
  });
}

export async function processStatementWithAI(
  base64File: string,
  householdId: string,
  year?: number
) {
  const targetYear = year || new Date().getFullYear();
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const allSubcategories = await prisma.subcategory.findMany({
      where: { householdId, year: targetYear }
    });

    const uniqueNames = Array.from(
      new Set(allSubcategories.map((s) => s.name))
    );

    const prompt = `
      Act as a financial data expert. Extract ALL transactions from this bank statement.
      
      MATCHING RULES:
      - Match transactions to these categories: ${uniqueNames.join(', ')}
      - If you find a match, you MUST return the ID for that category from this list:
        ${allSubcategories
          .filter((s) => s.month === new Date().getMonth() + 1)
          .map((s) => `${s.name} (ID: ${s.id})`)
          .join(', ')}
      - If a match is unclear, set "subcategoryId" to null.
      
      CRITICAL EXTRACTION RULES:
      1. **Multi-line Descriptions**: Combine wrapped descriptions into one string.
      2. **Trailing Minus Signs**: Return as negative numbers (e.g., -5883.32).
      3. **Date Normalization**: "YYYY-MM-DD".
      4. **Clean Numbers**: Remove symbols and commas.
      
      Return ONLY a JSON array: [{"date": "ISO string", "description": "string", "amount": number, "subcategoryId": "string or null"}]
    `;

    const result = await model.generateContent([
      { inlineData: { data: base64File, mimeType: 'application/pdf' } },
      { text: prompt }
    ]);

    const response = await result.response;
    const text = response.text();

    if (!text) {
      return { success: false, error: 'AI could not read the content.' };
    }

    const cleanedJson = text
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();
    const aiTransactions = JSON.parse(cleanedJson);

    const processedTransactions = await matchTransactionsWithRules(
      aiTransactions,
      householdId,
      targetYear
    );

    return {
      success: true,
      transactions: processedTransactions
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('--- ❌ Server Action Error:', message);
    return {
      success: false,
      error: message || 'A server error occurred while processing the PDF.'
    };
  }
}
