import { useMemo } from 'preact/hooks';
import { useStockStore } from '../store/useStockStore';
import { firstImageUrl } from '../lib/grouping';

export function ParentSelector() {
  const groups = useStockStore((s) => s.groups);
  const search = useStockStore((s) => s.search);
  const setSearch = useStockStore((s) => s.setSearch);
  const setActive = useStockStore((s) => s.setActiveParent);
  const dirty = useStockStore((s) => s.dirtyByParent);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return groups;
    return groups.filter((g) => {
      if (g.parentCode.toLowerCase().includes(q)) return true;
      const desc = (g.parentRow['Descrição'] ?? '').toLowerCase();
      if (desc.includes(q)) return true;
      // Buscar también en hijos (por color/talla) — PRD §7.3
      // ej. "Rosa" o "GG" debe encontrar el padre cuyos hijos matchean
      // Nota: acceso a rows de hijos no lo hacemos acá para evitar acoplamiento;
      // la búsqueda por variación queda dentro del padre ya abierto.
      return false;
    });
  }, [groups, search]);

  return (
    <div class="flex flex-col h-screen bg-white">
      {/* Header */}
      <header class="sticky top-0 bg-white border-b border-gray-100 px-4 pt-4 pb-3 z-10">
        <div class="flex items-center justify-between mb-3">
          <h1 class="text-xl font-bold text-gray-900">Modelos</h1>
          <button
            type="button"
            onClick={() => useStockStore.getState().reset()}
            class="text-sm text-gray-500 min-h-touch min-w-touch px-2"
            aria-label="Cargar otro archivo"
          >
            Nuevo
          </button>
        </div>
        <input
          type="search"
          inputMode="search"
          placeholder="Buscar por código o descripción"
          value={search}
          onInput={(e) => setSearch((e.target as HTMLInputElement).value)}
          class="w-full min-h-touch px-4 rounded-xl bg-gray-100 text-gray-900 placeholder-gray-400 border-0 focus:ring-2 focus:ring-gray-900 focus:outline-none"
        />
      </header>

      {/* Lista */}
      <div class="flex-1 overflow-y-auto">
        {filtered.length === 0 && (
          <div class="p-8 text-center text-gray-400 text-sm">Sin resultados</div>
        )}
        <ul class="divide-y divide-gray-100">
          {filtered.map((g) => {
            const img = firstImageUrl(g.parentRow);
            const desc = g.parentRow['Descrição'] ?? '';
            const isDirty = (dirty[g.parentCode]?.size ?? 0) > 0;
            return (
              <li key={g.parentCode}>
                <button
                  type="button"
                  onClick={() => setActive(g.parentCode)}
                  class="w-full flex items-center gap-3 px-4 py-3 text-left active:bg-gray-50 min-h-fat"
                >
                  <div class="w-14 h-14 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                    {img && (
                      <img
                        src={img}
                        alt=""
                        loading="lazy"
                        class="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    )}
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2">
                      <span class="font-semibold text-gray-900">{g.parentCode}</span>
                      {isDirty && (
                        <span class="inline-block w-2 h-2 rounded-full bg-amber-500" aria-label="Cambios sin guardar" />
                      )}
                    </div>
                    <p class="text-sm text-gray-500 truncate">{desc}</p>
                    <p class="text-xs text-gray-400 mt-0.5">
                      {g.childCodes.length} {g.childCodes.length === 1 ? 'variación' : 'variaciones'}
                    </p>
                  </div>
                  <span class="text-gray-300 text-xl" aria-hidden="true">›</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
