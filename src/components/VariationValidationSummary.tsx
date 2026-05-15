import { useStockStore } from '../store/useStockStore';

export function VariationValidationSummary() {
  const report = useStockStore((s) => s.variationReport);
  if (!report) return null;

  const hasWarnings = report.warnings.length > 0;
  const hasErrors = report.errors.length > 0;

  if (!hasWarnings && !hasErrors) return null;

  const title = hasErrors ? 'Problemas encontrados no CSV' : 'Avisos encontrados no CSV';

  return (
    <section
      class={`mb-4 rounded-2xl border p-4 ${
        hasErrors ? 'border-red-300 bg-red-50' : 'border-amber-300 bg-amber-50'
      }`}
      role="status"
      aria-live="polite"
    >
      <h2 class={`text-base font-bold ${hasErrors ? 'text-red-800' : 'text-amber-800'}`}>{title}</h2>

      <div class="mt-2 space-y-1 text-sm text-slate-700">
        <p>{report.total} variações analisadas</p>
        <p>{report.ok.length} OK</p>
        <p>{report.warnings.length} avisos</p>
        <p>{report.errors.length} erro crítico{report.errors.length === 1 ? '' : 's'}</p>
      </div>

      <p class={`mt-3 text-sm ${hasErrors ? 'text-red-700' : 'text-amber-700'}`}>
        {hasErrors
          ? 'Algumas variações não tiveram cor/tamanho identificados com segurança. Corrija o CSV antes de exportar.'
          : 'Algumas variações foram interpretadas por aproximação. Revise antes de continuar.'}
      </p>

      {hasErrors && (
        <ul class="mt-3 space-y-2">
          {report.errors.slice(0, 5).map((item) => (
            <li key={item.childCode} class="rounded-xl border border-red-200 bg-white p-3 text-sm text-slate-700">
              <p class="font-semibold text-slate-900">SKU: {item.childCode}</p>
              <p>Descrição: {item.rawDescricao || '(vazia)'}</p>
              <p>Problema: {item.parsed.issues.join(' | ')}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
