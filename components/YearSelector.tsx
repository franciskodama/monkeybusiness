'use client';

import React from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Calendar } from 'lucide-react';

export function YearSelector() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const currentYear = new Date().getFullYear();
  const selectedYear = searchParams.get('year') || currentYear.toString();

  const handleYearChange = (year: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('year', year);
    router.push(`${pathname}?${params.toString()}`);
  };

  const years = [
    (currentYear - 1).toString(),
    currentYear.toString(),
    (currentYear + 1).toString(),
    (currentYear + 2).toString()
  ];

  return (
    <div className="flex items-center gap-2">
      <Select value={selectedYear} onValueChange={handleYearChange}>
        <SelectTrigger className="w-[110px] h-8 bg-background/50 border-primary/20 hover:bg-background transition-colors text-xs font-bold uppercase tracking-tight">
          <Calendar size={12} className="mr-2 text-primary" />
          <SelectValue placeholder="Year" />
        </SelectTrigger>
        <SelectContent>
          {years.map((y) => (
            <SelectItem key={y} value={y} className="text-xs font-bold uppercase">
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
