import { useMemo, useState } from 'preact/hooks';
import { downloadBlob, exportCsv } from '../lib/csv';
import { useStockStore } from '../store/useStockStore';

export function ExportSuccessScreen() {
  const [busy, setBusy] = useState(false);

  const lastExportFilename = useStockStore((s) => s.lastExportFilename);
  const lastExportedAt = useStockStore((s) => s.lastExportedAt);
  const lastExportDirtyCount = useStockStore((s) => s.lastExportDirtyCount);
  const rows = useStockStore((s) => s.rows);
  const meta = useStockStore((s) => s.meta);
  const reset = useStockStore((s) => s.reset);
  const setExportStatus = useStockStore((s) => s.setExportStatus);
  const setCurrentScreen = useStockStore((s) => s.setCurrentScreen);

  const exportedAtLabel = useMemo(() => {
    if (!lastExportedAt) return 'Horário não disponível';
    return new Date(lastExportedAt).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [lastExportedAt]);

  function handleDownloadAgain() {
    if (!meta || !lastExportFilename) return;

    setBusy(true);
    try {
      const blob = exportCsv(rows, meta);
      downloadBlob(blob, lastExportFilename);
    } finally {
      setBusy(false);
    }
  }

  function handleContinueEditing() {
    setExportStatus('exported');
    setCurrentScreen('editor');
  }

  return (
    <div class="min-h-screen bg-slate-50 px-4 py-10 md:px-8">
      <div class="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-xl items-center justify-center">
        <main class="w-full rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-10">
          <div class="flex flex-col gap-5">
            <div class="mb-1 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-600 text-2xl font-bold text-white shadow-sm">
              ✓
            </div>

            <h1 class="text-2xl font-bold text-slate-900">CSV exportado com sucesso</h1>

            <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <p class="font-semibold text-slate-900">Arquivo:</p>
              <p class="mt-1 break-all font-mono text-xs">{lastExportFilename ?? 'Arquivo não disponível'}</p>

              <p class="mt-3">{lastExportDirtyCount} variações alteradas</p>
              <p class="mt-1">Exportado em {exportedAtLabel}</p>
            </div>

            <div class="flex flex-col gap-3">
              <button
                type="button"
                disabled={busy || !meta || !lastExportFilename}
                onClick={handleDownloadAgain}
                class="min-h-touch w-full rounded-2xl bg-blue-600 px-5 text-base font-bold text-white transition-transform active:scale-[0.98] disabled:opacity-50"
              >
                {busy ? 'Gerando CSV...' : 'Baixar novamente'}
              </button>

              <button
                type="button"
                onClick={handleContinueEditing}
                class="min-h-touch w-full rounded-2xl border border-slate-300 bg-white px-5 text-base font-semibold text-slate-800 transition-transform active:scale-[0.98]"
              >
                Continuar editando
              </button>

              <button
                type="button"
                onClick={reset}
                class="min-h-touch w-full rounded-2xl border border-slate-300 bg-white px-5 text-base font-semibold text-slate-700 transition-transform active:scale-[0.98]"
              >
                Carregar novo CSV
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
