'use client';

import { useState } from 'react';
import { Download, Upload, RefreshCw, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { seedHouseholdBudget } from '@/lib/actions';

export function BackupRestore({
  householdId,
  currentSubcategories
}: {
  householdId: string;
  currentSubcategories: any[];
}) {
  const [isRestoring, setIsRestoring] = useState(false);

  // 1. Logic to transform current state into a seedable JSON
  const handleExport = () => {
    try {
      const categoriesMap: Record<string, any> = {};

      currentSubcategories.forEach((sub) => {
        const catName = sub.category?.name || 'Uncategorized';
        if (!categoriesMap[catName]) {
          categoriesMap[catName] = { name: catName, subcategories: [] };
        }

        // Ensure we only grab one instance of each subcategory name for the template
        const exists = categoriesMap[catName].subcategories.find(
          (s: any) => s.name === sub.name
        );
        if (!exists) {
          categoriesMap[catName].subcategories.push({
            name: sub.name,
            amount: sub.amount
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
    } catch (err) {
      toast.error('Failed to generate backup.');
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
        const res = await seedHouseholdBudget(householdId, template);

        if (res.success) {
          toast.success('Budget structure successfully restored for 2026!');
          setTimeout(() => window.location.reload(), 1500);
        } else {
          toast.error('Database error during restoration.');
        }
      } catch (err) {
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
              Restore System
            </h4>
            <p className="text-sm text-emerald-700/70 lowercase">
              <span className="uppercase">U</span>pload your backup to rebuild
              all 12 months for 2026.
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
            className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {isRestoring ? 'Processing...' : 'Upload & Sync'}
          </Button>
        </div>
      </div>
    </div>
  );
}
