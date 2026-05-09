import { useRef, useState } from 'preact/hooks';
import { useStockStore } from '../store/useStockStore';
import { parseCsv } from '../lib/csv';
import { validateHeaders, validateRows } from '../schema';

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
      const headerCheck = validateHeaders(meta.fields);

      if (!headerCheck.ok) {
        setError(`Faltan columnas necesarias: ${headerCheck.missing.join(', ')}`);
        return;
      }

      if (rows.length === 0) {
        setError('El archivo no contiene productos.');
        return;
      }

      const rowCheck = validateRows(rows);

      if (!rowCheck.ok) {
        setError(rowCheck.message);
        return;
      }

      loadData(rows, meta);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo leer el archivo.');
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
    <div class="min-h-screen bg-rose-50 px-4 py-10 md:px-8">
      <div class="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-xl items-center justify-center">
        <main class="w-full rounded-[2rem] border border-rose-100 bg-white p-6 shadow-sm md:p-10">
          <div class="mx-auto flex w-full max-w-md flex-col gap-6">
            <div>
              <div class="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500 text-xl font-extrabold text-white shadow-sm">
                GM
              </div>

              <p class="text-xs font-semibold uppercase tracking-wide text-rose-500">
                FlowStock
              </p>

               <h1 class="mt-2 text-3xl font-bold text-gray-900">
                  Controle visual de estoque
              </h1>

              <p class="mt-2 text-sm leading-6 text-gray-500">
                Carga un producto de Bling y edita el stock por color y talla.
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
              class="min-h-fat w-full rounded-2xl bg-rose-500 px-5 text-lg font-bold text-white transition-transform active:scale-[0.98] disabled:opacity-50"
            >
              {busy ? 'Cargando...' : 'Cargar inventario'}
            </button>

            {error && (
              <div
                role="alert"
                class="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            
          </div>
        </main>
      </div>
    </div>
  );
}
