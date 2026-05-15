import { useState } from 'preact/hooks';

interface SizeStepperProps {
  size: string;
  value: number;
  isDirty?: boolean;
  onChange: (value: number) => void;
}

export function SizeStepper({ size, value, isDirty = false, onChange }: SizeStepperProps) {
  const [draft, setDraft] = useState(String(value));

  function normalize(raw: string): number {
    if (!raw.trim()) return 0;
    const parsed = Number(raw);
    if (!Number.isFinite(parsed) || parsed < 0) return 0;
    return Math.floor(parsed);
  }

  function commit(raw: string) {
    const next = normalize(raw);
    setDraft(String(next));
    onChange(next);
  }

  function increment() {
    const next = normalize(draft) + 1;
    setDraft(String(next));
    onChange(next);
  }

  function decrement() {
    const next = Math.max(0, normalize(draft) - 1);
    setDraft(String(next));
    onChange(next);
  }

  return (
    <div class={`flex min-h-[68px] items-center justify-between rounded-2xl border px-3 py-2 ${isDirty ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-white'}`}>
      <p class="w-10 text-base font-bold text-slate-800">{size}</p>

      <div class="flex items-center gap-2">
        <button type="button" onClick={decrement} class="h-[52px] w-[52px] rounded-xl border border-slate-300 bg-white text-2xl font-bold text-slate-700 active:scale-[0.98]" aria-label={`Diminuir tamanho ${size}`}>
          -
        </button>

        <input
          type="number"
          inputMode="numeric"
          min="0"
          step="1"
          value={draft}
          onInput={(e) => setDraft((e.target as HTMLInputElement).value)}
          onBlur={(e) => commit((e.target as HTMLInputElement).value)}
          class="h-[52px] w-[88px] rounded-xl border border-slate-300 bg-white text-center text-2xl font-bold text-slate-900"
        />

        <button type="button" onClick={increment} class="h-[52px] w-[52px] rounded-xl border border-slate-300 bg-white text-2xl font-bold text-slate-700 active:scale-[0.98]" aria-label={`Aumentar tamanho ${size}`}>
          +
        </button>
      </div>
    </div>
  );
}
