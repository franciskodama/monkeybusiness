'use client';

import { useState, useRef, useEffect } from 'react';
import { Check, Pencil, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { renameSubcategory } from '@/lib/actions';

interface EditableNameProps {
  initialName: string;
  householdId: string;
  year: number;
  onUpdateSuccess: (newName: string) => void;
}

export function EditableSubcategoryName({
  initialName,
  householdId,
  year,
  onUpdateSuccess
}: EditableNameProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(initialName);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setName(initialName);
  }, [initialName]);

  const handleSave = async () => {
    if (!name || name === initialName) {
      setIsEditing(false);
      setName(initialName);
      return;
    }

    setIsLoading(true);
    try {
      const result = await renameSubcategory({
        householdId,
        oldName: initialName,
        newName: name,
        year
      });

      if (result.success) {
        onUpdateSuccess(name);
        setIsEditing(false);
        toast.success(`Renamed to "${name}" across all months.`);
      } else {
        toast.error('Failed to rename. Name might already exist.');
        setName(initialName);
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') {
      setIsEditing(false);
      setName(initialName);
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-1 w-[20%]">
        <Input
          ref={inputRef}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          className="h-8 text-xs rounded-none border-primary/50 focus-visible:ring-1 focus-visible:ring-primary"
          disabled={isLoading}
          autoFocus
        />
        <div className="flex gap-0.5">
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-none"
            onClick={handleSave}
            disabled={isLoading}
          >
            <Check size={14} />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-none"
            onClick={() => {
              setIsEditing(false);
              setName(initialName);
            }}
            disabled={isLoading}
          >
            <X size={14} />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 group w-[20%]">
      <span className="text-sm font-medium">{initialName}</span>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary rounded-none"
        onClick={() => setIsEditing(true)}
      >
        <Pencil size={12} />
      </Button>
    </div>
  );
}
