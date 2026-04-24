import { useState } from 'preact/hooks';
import { useStockStore } from '../store/useStockStore';
import { buildExportFilename, downloadBlob, exportCsv } from '../lib/csv';

export function ExportButton() {
  const [busy, setBusy] = useState(false);
  const rows = useStockStore((s) => s.rows);
  const meta = useStockStore((s) => s.meta);
  const dirtyByParent = useStockStore((s) => s.dirtyByParent);

  const totalDirty = Object.values(dirtyByParent).reduce((acc, s) => acc + s.size, 0);

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
      class="w-full min-h-fat rounded-xl bg-gray-900 text-white font-semibold text-base active:scale-[0.98] transition-transform disabled:opacity-50"
    >
      {busy
        ? 'Exportando...'
        : totalDirty > 0
        ? `Exportar CSV (${totalDirty} cambios)`
        : 'Exportar CSV'}
    </button>
  );
}
