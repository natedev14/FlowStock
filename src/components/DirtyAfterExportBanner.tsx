import { useStockStore } from '../store/useStockStore';

export function DirtyAfterExportBanner() {
  const exportStatus = useStockStore((s) => s.exportStatus);
  const lastExportedAt = useStockStore((s) => s.lastExportedAt);

  if (exportStatus !== 'dirty_after_export') return null;

  const hourLabel = lastExportedAt
    ? new Date(lastExportedAt).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <section class="mb-4 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-900" role="status" aria-live="polite">
      <p class="text-sm font-semibold">Você alterou o estoque depois da última exportação.</p>
      <p class="mt-1 text-sm">Exporte novamente para baixar um CSV atualizado.</p>
      {hourLabel && <p class="mt-1 text-xs text-amber-700">Última exportação registrada às {hourLabel}.</p>}
    </section>
  );
}
