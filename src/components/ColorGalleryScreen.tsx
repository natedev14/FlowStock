import { useMemo } from 'preact/hooks';
import { buildColorGroups } from '../lib/buildColorGroups';
import { firstImageUrl } from '../lib/grouping';
import { useStockStore } from '../store/useStockStore';
import { ColorCard } from './ColorCard';
import { DirtyAfterExportBanner } from './DirtyAfterExportBanner';
import { ExportButton } from './ExportButton';
import { VariationValidationSummary } from './VariationValidationSummary';

export function ColorGalleryScreen() {
  const activeParentCode = useStockStore((s) => s.activeParentCode);
  const groups = useStockStore((s) => s.groups);
  const rows = useStockStore((s) => s.rows);
  const indexByCode = useStockStore((s) => s.indexByCode);
  const dirtyByParent = useStockStore((s) => s.dirtyByParent);
  const setActiveColor = useStockStore((s) => s.setActiveColor);
  const setCurrentScreen = useStockStore((s) => s.setCurrentScreen);
  const search = useStockStore((s) => s.search);
  const setSearch = useStockStore((s) => s.setSearch);

  const group = groups.find((g) => g.parentCode === activeParentCode) ?? null;
  const parentRow = group?.parentRow ?? null;
  const parentImg = parentRow ? firstImageUrl(parentRow) : null;

  const colorGroups = useMemo(() => {
    if (!group) return [];

    return buildColorGroups({
      rows,
      indexByCode,
      childCodes: group.childCodes,
      dirtyChildren: dirtyByParent[group.parentCode],
    });
  }, [group, rows, indexByCode, dirtyByParent]);

  const filteredGroups = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return colorGroups;
    return colorGroups.filter((c) => c.color.toLowerCase().includes(q));
  }, [search, colorGroups]);

  if (!group || !parentRow) {
    return (
      <div class="flex min-h-screen items-center justify-center bg-slate-50 p-6 text-center text-slate-500">
        <p>Produto não encontrado.</p>
      </div>
    );
  }

  return (
    <div class="flex min-h-screen flex-col bg-slate-50">
      <header class="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div class="mx-auto w-full max-w-3xl px-4 py-4">
          <p class="text-xs font-semibold uppercase tracking-wide text-blue-600">FlowStock</p>
          <div class="mt-2 flex items-center gap-3">
            <div class="h-14 w-14 overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-200">
              {parentImg && <img src={parentImg} alt={parentRow['Descrição'] ?? group.parentCode} class="h-full w-full object-contain p-1" />}
            </div>
            <div class="min-w-0">
              <p class="font-mono text-xs font-semibold uppercase tracking-wide text-blue-600">{group.parentCode}</p>
              <h1 class="truncate text-base font-bold text-slate-900">{parentRow['Descrição']}</h1>
              <p class="mt-1 text-xs text-slate-500">{colorGroups.length} cores · {group.childCodes.length} variações</p>
            </div>
          </div>
        </div>
      </header>

      <main class="mx-auto w-full max-w-3xl flex-1 px-4 py-4">
        <DirtyAfterExportBanner />
        <VariationValidationSummary />

        <div class="mb-4">
          <input
            type="search"
            inputMode="search"
            placeholder="Buscar cor"
            value={search}
            onInput={(e) => setSearch((e.target as HTMLInputElement).value)}
            class="min-h-touch w-full rounded-2xl border border-slate-200 bg-white px-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>

        <div class="space-y-3">
          {filteredGroups.length === 0 ? (
            <div class="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-400">Nenhuma cor encontrada</div>
          ) : (
            filteredGroups.map((colorGroup) => (
              <ColorCard
                key={colorGroup.color}
                group={colorGroup}
                onClick={() => {
                  setActiveColor(colorGroup.color);
                  // Fase 5 irá substituir este destino por ColorCountScreen.
                  setCurrentScreen('editor');
                }}
              />
            ))
          )}
        </div>
      </main>

      <footer class="sticky bottom-0 z-20 border-t border-slate-200 bg-white/95 px-3 py-3 pb-[max(env(safe-area-inset-bottom),0.75rem)] backdrop-blur">
        <div class="mx-auto w-full max-w-3xl">
          <ExportButton />
        </div>
      </footer>
    </div>
  );
}
