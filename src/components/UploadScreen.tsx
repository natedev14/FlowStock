import { useRef, useState } from 'preact/hooks';
import { useStockStore } from '../store/useStockStore';
import { parseCsv } from '../lib/csv';
import { validateHeaders } from '../schema';

export function UploadScreen() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const loadData = useStockStore((s) => s.loadData);

  async function handleFile(file: File) {
    setError(null);
    setBusy(true);

    try {
      const { rows, meta } = await parseCsv(file);
      const check = validateHeaders(meta.fields);

      if (!check.ok) {
        setError(`Archivo de ERP no compatible. Faltan columnas: ${check.missing.join(', ')}`);
        setBusy(false);
        return;
      }

      if (rows.length === 0) {
        setError('El archivo no contiene filas de datos.');
        setBusy(false);
        return;
      }

      loadData(rows, meta);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al leer el archivo.');
    } finally {
      setBusy(false);
    }
  }

  function onChange(e: Event) {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];

    if (file) {
      handleFile(file);
    }

    target.value = '';
  }

  return (
    <div class="min-h-screen bg-slate-50 px-4 py-10 md:px-8">
      <div class="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-3xl items-center justify-center rounded-3xl border border-gray-200 bg-white p-6 shadow-sm md:p-10">
        <div class="mx-auto flex w-full max-w-md flex-col gap-6">
          <div class="inline-flex w-fit items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            Flujo rápido de inventario
          </div>
          <div>
            <p class="text-xs font-semibold uppercase tracking-wide text-blue-600">
              Gissary Stock Editor
            </p>

            <h2 class="mt-2 text-2xl font-bold text-gray-900">
              Cargar CSV de productos
            </h2>

            <p class="mt-2 text-sm leading-6 text-gray-500">
              Selecciona el archivo exportado desde Bling. La app lo procesará localmente para que puedas contar stock de forma visual.
            </p>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            class="hidden"
            onChange={onChange}
          />

          <button
            type="button"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
            class="min-h-fat w-full rounded-2xl bg-blue-600 px-5 text-lg font-bold text-white transition-transform active:scale-[0.98] disabled:opacity-50"
          >
            {busy ? 'Cargando CSV...' : 'Seleccionar CSV'}
          </button>

          {error && (
            <div
              role="alert"
              class="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          <div class="rounded-2xl border border-gray-100 bg-gray-50 p-4">
            <p class="text-sm font-semibold text-gray-900">
              Procesamiento local
            </p>
            <p class="mt-1 text-xs leading-5 text-gray-500">
              Tu archivo no se sube a ningún servidor. Se lee directamente en este navegador.
            </p>
          </div>

          <p class="text-center text-xs text-gray-400">
            Formato esperado: CSV de productos de Bling con columnas Código, Código Pai, Descrição, Estoque e imágenes.
          </p>
        </div>
      </div>
    </div>
  );
}
