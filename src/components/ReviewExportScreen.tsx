import { useMemo } from 'preact/hooks';
import { buildColorGroups } from '../lib/buildColorGroups';
import { useStockStore } from '../store/useStockStore';
import { DirtyAfterExportBanner } from './DirtyAfterExportBanner';
import { ExportButton } from './ExportButton';
import { VariationValidationSummary } from './VariationValidationSummary';

export function ReviewExportScreen() {
  const activeParentCode = useStockStore((s) => s.activeParentCode);
  const groups = useStockStore((s) => s.groups);
  const rows = useStockStore((s) => s.rows);
  const indexByCode = useStockStore((s) => s.indexByCode);
  const dirtyByParent = useStockStore((s) => s.dirtyByParent);
  const hasBlockingVariationErrors = useStockStore((s) => s.hasBlockingVariationErrors);
  const setCurrentScreen = useStockStore((s) => s.setCurrentScreen);

  const group = groups.find((g) => g.parentCode === activeParentCode) ?? null;
  const colorGroups = useMemo(() => {
    if (!group) return [];
    return buildColorGroups({ rows, indexByCode, childCodes: group.childCodes, dirtyChildren: dirtyByParent[group.parentCode] });
  }, [group, rows, indexByCode, dirtyByParent]);

  const editedColors = colorGroups.filter((g) => g.status === 'edited').length;
  const pendingColors = colorGroups.filter((g) => g.status === 'pending').length;
  const dirtyCount = Array.from(dirtyByParent[group?.parentCode ?? ''] ?? []).length;

  if (!group) return null;

  return (
    <div class="min-h-screen bg-slate-50 px-4 py-4">
      <main class="mx-auto w-full max-w-3xl">
        <h1 class="text-2xl font-bold text-slate-900">Revisar contagem</h1>

        <DirtyAfterExportBanner />
        <VariationValidationSummary />

        <section class="mt-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <p class="text-sm text-slate-700">{colorGroups.length} cores</p>
          <p class="text-sm text-slate-700">{group.childCodes.length} variações</p>
          <p class="text-sm text-slate-700">{dirtyCount} variações alteradas</p>

          <div class="mt-3 text-sm text-slate-700">
            <p>Status:</p>
            <p>- {editedColors} cores editadas</p>
            <p>- {pendingColors} cores pendentes</p>
          </div>

          {hasBlockingVariationErrors && (
            <div class="mt-3 rounded-2xl border border-red-300 bg-red-50 p-3 text-sm text-red-700">
              Não é possível exportar. Corrija os erros do CSV antes de exportar.
            </div>
          )}

          <div class="mt-4 space-y-3">
            <ExportButton />
            <button type="button" onClick={() => setCurrentScreen('colors')} class="min-h-touch w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 active:scale-[0.98]">
              Continuar contagem
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
