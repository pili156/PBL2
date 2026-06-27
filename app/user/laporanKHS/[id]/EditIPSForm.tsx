'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil, Check, X, Loader2 } from 'lucide-react';
import { updateIPS } from '../actions';

interface EditIPSFormProps {
  khsId: number;
  currentValue: number | null;
  isRevisi: boolean;
  hideEdit?: boolean;
}

export default function EditIPSForm({ khsId, currentValue, isRevisi, hideEdit }: EditIPSFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(currentValue ? Number(currentValue).toFixed(2) : '');
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    const numVal = parseFloat(value);
    if (isNaN(numVal) || numVal < 0 || numVal > 4) {
      setError('IPS harus antara 0 - 4.00');
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await updateIPS(khsId, numVal);
      if (result?.error) {
        setError(result.error);
      } else {
        setIsEditing(false);
        router.refresh();
      }
    });
  };

  const handleCancel = () => {
    setValue(currentValue ? Number(currentValue).toFixed(2) : '');
    setIsEditing(false);
    setError(null);
  };

  if (isEditing) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <input
            type="number"
            step="0.01"
            min="0"
            max="4.00"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setError(null);
            }}
            className="w-32 p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none"
            autoFocus
            disabled={isPending}
          />
          <button
            onClick={handleSave}
            disabled={isPending}
            className="p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
          >
            {isPending ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
          </button>
          <button
            onClick={handleCancel}
            disabled={isPending}
            className="p-1.5 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300 transition-colors disabled:opacity-50"
          >
            <X size={14} />
          </button>
        </div>
        {error && <p className="text-[11px] text-red-500">{error}</p>}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-bold text-slate-800">
        {currentValue ? Number(currentValue).toFixed(2) : '-'}
      </span>
      {isRevisi && !hideEdit && (
        <button
          onClick={() => setIsEditing(true)}
          className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
          title="Edit IPS"
        >
          <Pencil size={12} />
        </button>
      )}
    </div>
  );
}
