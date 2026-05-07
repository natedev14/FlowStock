import { useEffect, useMemo, useState } from 'preact/hooks';
import { useStockStore } from '../store/useStockStore';
import { StockMatrix } from './StockMatrix';
import { ExportButton } from './ExportButton';
import { firstImageUrl } from '../lib/grouping';
import { parseDescricao } from '../lib/parseDescricao';

export function EditorScreen() {
  const activeParentCode = useStockStore((s) => s.activeParentCode);
  const group = useStockStore((s) =>
    s.groups.find((g) => g.parentCode === activeParentCode)
  );
  const reset = useStockStore((s) => s.reset);
  const rows = useStockStore((s) => s.rows);
  const indexByCode = useStockStore((s) => s.indexByCode);
  const persistActive = useStockStore((s) => s.persistActive);

  const [searchVar, setSearchVar] = useState('');

  useEffect(() => {
    return () => {
      persistActive();
    };
  }, [activeParentCode, persistActive]);

  const parentRow = group?.parentRow;
  const parentImg = parentRow ? firstImageUrl(parentRow) : null;

  const filteredChildren = useMemo(() => {
    if (!group) return [];

    const q = searchVar.trim().toLowerCase();
    if (!q) return group.childCodes;

    return group.childCodes.filter((code) => {
      const idx = indexByCode.get(code);
      if (idx === undefined) return false;

      const row = rows[idx];
      const parsed = parseDescricao(row['Descrição'] ?? '');

      return parsed.cor?.toLowerCase().includes(q) ?? false;
    });
  }, [group, searchVar, rows, indexByCode]);

  if (!group || !parentRow) {
    return (
      <div class="flex min-h-screen items-center justify-center bg-rose-50 p-6 text-center text-gray-500">
        <div>
          <p class="mb-4">No se encontró el producto.</p>
          <button
            type="button"
            class="rounded-xl bg-rose-500 px-5 py-3 font-semibold text-white"
            onClick={() => reset()}
          >
            Cargar inventario
          </button>
        </div>
      </div>
    );
  }

  return (
    <div class="flex min-h-screen flex-col bg-white">
      <header class="sticky top-0 z-20 border-b border-rose-100 bg-white/95 backdrop-blur">
        <div class="mx-auto flex w-full max-w-7xl items-center gap-4 px-4 py-4 md:px-8">
          <button
            type="button"
            onClick={() => {
              persistActive();
              reset();
            }}
            class="-ml-2 flex min-h-touch min-w-touch items-center justify-center rounded-xl text-2xl text-gray-700 hover:bg-rose-50"
            aria-label="Cargar otro inventario"
          >
            ‹
          </button>

          <div class="h-16 w-16 flex-shrink-0 overflow-hidden rounded-2xl bg-rose-50 md:h-24 md:w-24">
            {parentImg && (
              <img
                src={parentImg}
                alt={parentRow['Descrição'] ?? group.parentCode}
                class="h-full w-full object-contain p-1"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
          </div>

          <div class="min-w-0 flex-1">
            <p class="font-mono text-xs font-semibold uppercase tracking-wide text-rose-500">
              {group.parentCode}
            </p>

            <h1 class="truncate text-base font-bold text-gray-900 md:text-xl">
              {parentRow['Descrição']}
            </h1>

            <p class="mt-1 text-xs text-gray-500 md:text-sm">
              {group.childCodes.length} variaciones
            </p>
          </div>
        </div>

        <div class="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 pb-4 md:flex-row md:px-8">
          <input
            type="search"
            inputMode="search"
            placeholder="Buscar color"
            value={searchVar}
            onInput={(e) => setSearchVar((e.target as HTMLInputElement).value)}
            class="min-h-touch w-full rounded-xl border-0 bg-rose-50/60 px-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-300"
          />
        </div>
      </header>

      <main class="mx-auto w-full max-w-7xl flex-1 px-4 py-4 md:px-8 md:py-8">
        {filteredChildren.length === 0 ? (
          <div class="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center text-sm text-gray-400">
            Sin colores que coincidan
          </div>
        ) : (
          <StockMatrix parentCode={group.parentCode} childCodes={filteredChildren} />
        )}
      </main>

      <footer class="sticky bottom-0 z-20 border-t border-rose-100 bg-white px-3 py-3 pb-[max(env(safe-area-inset-bottom),0.75rem)]">
        <div class="mx-auto flex w-full max-w-7xl justify-center md:justify-end">
          <div class="w-full md:max-w-md">
            <ExportButton />
          </div>
        </div>
      </footer>
    </div>
  );
}
