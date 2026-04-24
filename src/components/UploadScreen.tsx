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
    if (file) handleFile(file);
    // permitir recargar el mismo archivo
    target.value = '';
  }

  return (
    <div class="min-h-screen flex flex-col items-center justify-center px-6 py-10 bg-white">
      <div class="w-full max-w-sm flex flex-col items-center gap-6">
        <div class="w-20 h-20 rounded-2xl bg-gray-900 flex items-center justify-center">
          <span class="text-white font-extrabold text-2xl">GM</span>
        </div>
        <div class="text-center">
          <h1 class="text-2xl font-bold text-gray-900">Gissary Stock Editor</h1>
          <p class="text-sm text-gray-500 mt-2">Cargá el CSV de Bling para empezar</p>
        </div>

        {/* Input oculto — PRD §5 */}
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
          class="w-full min-h-fat bg-gray-900 text-white text-lg font-semibold rounded-2xl active:scale-[0.98] transition-transform disabled:opacity-50"
        >
          {busy ? 'Cargando...' : 'Cargar Modelo'}
        </button>

        {error && (
          <div role="alert" class="w-full p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        <p class="text-xs text-gray-400 text-center">
          El archivo se procesa localmente. No se sube a ningún servidor.
        </p>
      </div>
    </div>
  );
}
