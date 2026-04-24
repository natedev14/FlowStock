import { useMemo } from 'preact/hooks';
import { useStockStore } from '../store/useStockStore';
import { formatParsedDescricao, parseDescricao } from '../lib/parseDescricao';
import { firstImageUrl } from '../lib/grouping';

interface Props {
  parentCode: string;
  childCode: string;
  auditValue: number | null;
  onAuditChange: (next: number) => void;
}

export function VariationCard({ parentCode, childCode, auditValue, onAuditChange }: Props) {
  const row = useStockStore((s) => {
    const idx = s.indexByCode.get(childCode);
    return idx !== undefined ? s.rows[idx] : undefined;
  });
  const mode = useStockStore((s) => s.mode);
  const isDirty = useStockStore((s) => s.dirtyByParent[parentCode]?.has(childCode) ?? false);
  const bumpChildStock = useStockStore((s) => s.bumpChildStock);
  const updateChildStock = useStockStore((s) => s.updateChildStock);

  const parsed = useMemo(() => parseDescricao(row?.['Descrição'] ?? ''), [row]);
  const label = formatParsedDescricao(parsed);
  const img = row ? firstImageUrl(row) : null;

  if (!row) return null;

  const savedValue = parseInt(row['Estoque'] ?? '0', 10) || 0;
  const displayValue = mode === 'audit' ? (auditValue ?? 0) : savedValue;

  function decrement() {
    if (mode === 'audit') {
      onAuditChange(Math.max(0, (auditValue ?? 0) - 1));
    } else {
      bumpChildStock(parentCode, childCode, -1);
    }
  }

  function increment() {
    if (mode === 'audit') {
      onAuditChange((auditValue ?? 0) + 1);
    } else {
      bumpChildStock(parentCode, childCode, 1);
    }
  }

  function onInput(e: Event) {
    const v = (e.target as HTMLInputElement).value;
    const n = parseInt(v, 10);
    const safe = isFinite(n) && n >= 0 ? n : 0;
    if (mode === 'audit') {
      onAuditChange(safe);
    } else {
      updateChildStock(parentCode, childCode, String(safe));
    }
  }

  function commitAudit() {
    if (mode !== 'audit' || auditValue == null) return;
    updateChildStock(parentCode, childCode, String(auditValue));
  }

  return (
    <div
      class={`rounded-2xl border p-4 bg-white transition-colors ${
        isDirty ? 'border-amber-400' : 'border-gray-200'
      }`}
    >
      <div class="flex items-start gap-3 mb-4">
        <div class="w-16 h-16 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
          {img && (
            <img
              src={img}
              alt=""
              loading="lazy"
              class="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          )}
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-xs text-gray-400 font-mono">{childCode}</p>
          <p class="text-sm font-semibold text-gray-900 leading-tight">{label}</p>
          <p class="text-xs text-gray-400 mt-1">
            Actual: <span class="font-mono">{savedValue}</span>
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button
          type="button"
          onClick={decrement}
          class="flex-shrink-0 min-h-fat w-[56px] h-[56px] rounded-xl bg-gray-100 text-gray-900 text-2xl font-bold active:bg-gray-200 active:scale-95 transition-all"
          aria-label="Restar"
        >
          −
        </button>

        <input
          type="number"
          inputMode="numeric"
          pattern="[0-9]*"
          min="0"
          step="1"
          value={String(displayValue)}
          onInput={onInput}
          class="flex-1 min-h-fat text-center text-2xl font-bold text-gray-900 bg-gray-50 rounded-xl border-0 focus:ring-2 focus:ring-gray-900 focus:outline-none"
        />

        <button
          type="button"
          onClick={increment}
          class="flex-shrink-0 min-h-fat w-[56px] h-[56px] rounded-xl bg-gray-900 text-white text-2xl font-bold active:bg-gray-700 active:scale-95 transition-all"
          aria-label="Sumar"
        >
          +
        </button>
      </div>

      {mode === 'audit' && (
        <button
          type="button"
          onClick={commitAudit}
          disabled={auditValue == null || auditValue === savedValue}
          class="mt-3 w-full min-h-touch rounded-lg bg-gray-900 text-white text-sm font-semibold active:scale-[0.98] transition-transform disabled:opacity-30"
        >
          Guardar conteo
        </button>
      )}
    </div>
  );
}
