import { useStockStore } from '../store/useStockStore';
import type { Mode } from '../types';

export function ModeToggle() {
  const mode = useStockStore((s) => s.mode);
  const setMode = useStockStore((s) => s.setMode);

  return (
    <div class="flex gap-2 p-1 bg-gray-100 rounded-xl">
      <ModeButton current={mode} value="quick" onClick={() => setMode('quick')} label="Ajuste Rápido" />
      <ModeButton current={mode} value="audit" onClick={() => setMode('audit')} label="Auditoría" />
    </div>
  );
}

function ModeButton({
  current,
  value,
  onClick,
  label,
}: {
  current: Mode;
  value: Mode;
  onClick: () => void;
  label: string;
}) {
  const active = current === value;
  return (
    <button
      type="button"
      onClick={onClick}
      class={`flex-1 min-h-touch px-3 rounded-lg text-sm font-semibold transition-colors ${
        active ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
      }`}
    >
      {label}
    </button>
  );
}
