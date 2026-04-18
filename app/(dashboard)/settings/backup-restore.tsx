'use client';

import { useState } from 'react';
import { Download, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { seedHouseholdBudget } from '@/lib/actions/budget';
import { exportHouseholdData } from '@/lib/actions/backup';
import { SubcategoryWithCategory, BudgetTemplateCategory } from '@/lib/types';

export function BackupRestore({
  householdId,
  currentSubcategories,
  year
}: {
  householdId: string;
  currentSubcategories: SubcategoryWithCategory[];
  year: number;
}) {
  const [isRestoring, setIsRestoring] = useState(false);
  const [isExportingFull, setIsExportingFull] = useState(false);

  // 1. Logic to transform current state into a seedable JSON
  const handleExport = () => {
    try {
      const categoriesMap: Record<string, BudgetTemplateCategory> = {};

      currentSubcategories.forEach((sub) => {
        const category = sub.category;
        const catName = category?.name || 'Uncategorized';
        if (!categoriesMap[catName]) {
          categoriesMap[catName] = {
            name: catName,
            color: category?.color || 'BLUE',
            isIncome: category?.isIncome || false,
            isSavings: category?.isSavings || false,
            isFixed: category?.isFixed || false,
            order: category?.order || 0,
            subcategories: []
          };
        }

        // Ensure we only grab one instance of each subcategory name for the template
        const exists = categoriesMap[catName].subcategories.find(
          (s) => s.name === sub.name
        );
        if (!exists) {
          categoriesMap[catName].subcategories.push({
            name: sub.name,
            amount: sub.amount || 0
          });
        }
      });

      const dataStr = JSON.stringify(Object.values(categoriesMap), null, 2);
      const blob = new Blob([dataStr], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `budget-config-backup-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Backup file created and downloaded!');
    } catch {
      toast.error('Failed to generate backup.');
    }
  };

  const handleFullExport = async () => {
    setIsExportingFull(true);
    try {
      const data = await exportHouseholdData();
      const dataStr = JSON.stringify(data, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `monkeybusiness-full-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Full historical backup downloaded!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to export historical data.');
    } finally {
      setIsExportingFull(false);
    }
  };

  // 2. Logic to read the TXT file and trigger the Server Action
  const handleRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsRestoring(true);
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const template = JSON.parse(content);

        // This calls the upsert/createMany logic we fixed
        const res = await seedHouseholdBudget(householdId, template, year);

        if (res.success) {
          toast.success(`Budget structure successfully restored for ${year}!`);
          setTimeout(() => window.location.reload(), 1500);
        } else {
          toast.error('Database error during restoration.');
        }
      } catch {
        toast.error(
          'Invalid file format. Please upload a valid budget backup.'
        );
      } finally {
        setIsRestoring(false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="grid gap-6">
      {/* Export Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 border bg-secondary/5 gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-background border shadow-sm text-primary">
            <Download size={20} />
          </div>
          <div>
            <h4 className="text-base font-bold uppercase tracking-tight">
              Export Config
            </h4>
            <p className="text-sm text-muted-foreground">
              Save your categories and targets to a local file.
            </p>
          </div>
        </div>
        <Button
          onClick={handleExport}
          variant="outline"
          className="w-full md:w-auto"
        >
          Download .txt
        </Button>
      </div>

      {/* Restore Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 border bg-emerald-50/50 border-emerald-100 gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-background border shadow-sm text-emerald-600">
            <RefreshCw
              size={20}
              className={isRestoring ? 'animate-spin' : ''}
            />
          </div>
          <div>
            <h4 className="text-base font-bold uppercase tracking-tight text-emerald-900">
              Restore Structure
            </h4>
            <p className="text-sm text-emerald-700/70 lowercase">
              <span className="uppercase">U</span>pload your config backup to
              rebuild all 12 months for {year}.
            </p>
          </div>
        </div>
        <div>
          <input
            type="file"
            id="restore-file"
            className="hidden"
            accept=".txt"
            onChange={handleRestore}
            disabled={isRestoring}
          />
          <Button
            onClick={() => document.getElementById('restore-file')?.click()}
            disabled={isRestoring}
            className="w-full md:w-auto border-[1.6px] border-emerald-700 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {isRestoring ? 'Processing...' : 'Upload Structure'}
          </Button>
        </div>
      </div>

      {/* Full Historical Backup Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 border bg-blue-50/50 border-blue-100 gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-background border shadow-sm text-blue-600">
            <Download size={20} />
          </div>
          <div>
            <h4 className="text-base font-bold uppercase tracking-tight text-blue-900">
              Full Historical Data
            </h4>
            <p className="text-sm text-blue-700/70">
              Download everything: Transactions, categories, subcategories,
              rules, and commitments.
            </p>
          </div>
        </div>
        <Button
          onClick={handleFullExport}
          disabled={isExportingFull}
          variant="outline"
        >
          {isExportingFull ? 'Preparing...' : <>Download .json</>}
        </Button>
      </div>
    </div>
  );
}
