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
  const updateChildStock = useStockStore((s) => s.updateChildStock);

  const parsed = useMemo(() => parseDescricao(row?.['Descrição'] ?? ''), [row]);
  const label = formatParsedDescricao(parsed);
  const img = row ? firstImageUrl(row) : null;

  if (!row) return null;

  const savedValue = parseInt(row['Estoque'] ?? '0', 10) || 0;
  const displayValue = mode === 'audit' ? (auditValue ?? 0) : savedValue;

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
      class={`rounded-3xl border p-4 md:p-6 bg-white shadow-sm transition-colors ${
        isDirty ? 'border-amber-400 bg-amber-50 ring-2 ring-amber-100' : 'border-gray-200'
      }`}
    >
      <div class="flex flex-col sm:flex-row gap-4 mb-5">
        <div class="w-full sm:w-32 md:w-40 aspect-square rounded-2xl bg-gray-100 flex-shrink-0 overflow-hidden">
          {img && (
            <img
              src={img}
              alt={label}
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

          <p class="text-base md:text-lg font-semibold text-gray-900 leading-tight mt-1">
            {label}
          </p>

          <p class="text-sm text-gray-500 mt-2">
            Stock actual:{' '}
            <span class="font-mono font-semibold text-gray-900">
              {savedValue}
            </span>
          </p>
        </div>
      </div>

      <div class="flex flex-col gap-2">
        <label class="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Conteo físico
        </label>

        <input
          type="number"
          inputMode="numeric"
          pattern="[0-9]*"
          min="0"
          step="1"
          value={String(displayValue)}
          onInput={onInput}
          class={`w-full min-h-fat text-center text-3xl md:text-4xl font-bold rounded-2xl border-2 bg-white focus:outline-none focus:ring-4 ${
            isDirty
              ? 'border-amber-400 focus:border-amber-500 focus:ring-amber-100'
              : 'border-gray-200 focus:border-blue-600 focus:ring-blue-100'
          }`}
        />
      </div>

      {mode === 'audit' && (
        <button
          type="button"
          onClick={commitAudit}
          disabled={auditValue == null || auditValue === savedValue}
          class="mt-4 w-full min-h-touch rounded-xl bg-blue-600 text-white text-sm font-semibold active:scale-[0.98] transition-transform disabled:opacity-30"
        >
          Guardar conteo
        </button>
      )}
    </div>
  );
}
