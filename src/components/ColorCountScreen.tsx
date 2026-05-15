import { useEffect, useMemo } from 'preact/hooks';
import { buildColorGroups } from '../lib/buildColorGroups';
import { useStockStore } from '../store/useStockStore';
import { DirtyAfterExportBanner } from './DirtyAfterExportBanner';
import { SizeStepper } from './SizeStepper';
import { VariationValidationSummary } from './VariationValidationSummary';

export function ColorCountScreen() {
  const activeParentCode = useStockStore((s) => s.activeParentCode);
  const activeColor = useStockStore((s) => s.activeColor);
  const groups = useStockStore((s) => s.groups);
  const rows = useStockStore((s) => s.rows);
  const indexByCode = useStockStore((s) => s.indexByCode);
  const dirtyByParent = useStockStore((s) => s.dirtyByParent);
  const updateChildStock = useStockStore((s) => s.updateChildStock);
  const persistActive = useStockStore((s) => s.persistActive);
  const setCurrentScreen = useStockStore((s) => s.setCurrentScreen);
  const setActiveColor = useStockStore((s) => s.setActiveColor);

  const group = groups.find((g) => g.parentCode === activeParentCode) ?? null;

  const colorGroups = useMemo(() => {
    if (!group) return [];
    return buildColorGroups({ rows, indexByCode, childCodes: group.childCodes, dirtyChildren: dirtyByParent[group.parentCode] });
  }, [group, rows, indexByCode, dirtyByParent]);

  const colorIndex = colorGroups.findIndex((g) => g.color === activeColor);
  const colorGroup = colorIndex >= 0 ? colorGroups[colorIndex] : null;

  useEffect(() => {
    if (!group || !activeColor || !colorGroup) {
      setCurrentScreen('colors');
    }
  }, [group, activeColor, colorGroup, setCurrentScreen]);

  if (!group || !activeColor || !colorGroup) {
    return null;
  }

  const nextColor = colorGroups[colorIndex + 1]?.color ?? null;

  return (
    <div class="min-h-screen bg-slate-50">
      <header class="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur">
        <button type="button" onClick={() => setCurrentScreen('colors')} class="text-sm font-semibold text-blue-600">← Cores</button>
      </header>

      <main class="mx-auto w-full max-w-3xl px-4 py-4">
        <DirtyAfterExportBanner />
        <VariationValidationSummary />

        <section class="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <div class="mb-4 flex h-[170px] items-center justify-center rounded-2xl bg-slate-50 p-3">
            {colorGroup.imageUrl ? (
              <img src={colorGroup.imageUrl} alt={colorGroup.color} class="h-full w-full object-contain" />
            ) : (
              <span class="text-sm text-slate-400">Sem imagem</span>
            )}
          </div>

          <h1 class="text-2xl font-bold text-slate-900">{colorGroup.color}</h1>
          <p class="mt-1 text-sm text-slate-600">Total: {colorGroup.totalStock} peças · {colorGroup.sizes.length} tamanhos</p>

          <div class="mt-4 space-y-2.5">
            {colorGroup.sizes.map((cell) => (
              <SizeStepper
                key={`${cell.childCode}-${cell.size}`}
                size={cell.size}
                value={cell.stock}
                isDirty={cell.isDirty}
                onChange={(nextValue) => updateChildStock(group.parentCode, cell.childCode, String(nextValue))}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              persistActive();
              if (nextColor) {
                setActiveColor(nextColor);
                setCurrentScreen('count');
                return;
              }
              setActiveColor(null);
              setCurrentScreen('review_export');
            }}
            class="mt-5 min-h-touch w-full rounded-2xl bg-blue-600 px-4 py-3 text-base font-bold text-white active:scale-[0.98]"
          >
            {nextColor ? 'Salvar e próximo' : 'Finalizar contagem'}
          </button>
        </section>
      </main>
    </div>
  );
}
