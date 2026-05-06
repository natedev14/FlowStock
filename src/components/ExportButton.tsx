import { useState } from 'preact/hooks';
import { useStockStore } from '../store/useStockStore';
import { buildExportFilename, downloadBlob, exportCsv } from '../lib/csv';

export function ExportButton() {
  const [busy, setBusy] = useState(false);

  const rows = useStockStore((s) => s.rows);
  const meta = useStockStore((s) => s.meta);
  const dirtyByParent = useStockStore((s) => s.dirtyByParent);

  const totalDirty = Object.values(dirtyByParent).reduce(
    (acc, changedChildren) => acc + changedChildren.size,
    0
  );

  const editedParents = Object.values(dirtyByParent).filter(
    (changedChildren) => changedChildren.size > 0
  ).length;

  function handleExport() {
    if (!meta) return;

    setBusy(true);

    try {
      const blob = exportCsv(rows, meta);
      downloadBlob(blob, buildExportFilename());
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={busy || !meta}
      class="w-full min-h-fat rounded-2xl bg-blue-600 px-4 py-3 text-white shadow-sm transition-transform active:scale-[0.98] disabled:opacity-50"
    >
      <span class="block text-base font-bold">
        {busy ? 'Exportando CSV...' : 'Exportar CSV'}
      </span>

      <span class="mt-0.5 block text-xs font-medium text-blue-100">
        {totalDirty > 0
          ? `${totalDirty} variaciones modificadas en ${editedParents} producto${
              editedParents === 1 ? '' : 's'
            }`
          : 'Sin cambios todavía'}
      </span>
    </button>
  );
}
