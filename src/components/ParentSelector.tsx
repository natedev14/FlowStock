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

    if (!q) {
      return groups;
    }

    return groups.filter((g) => {
      if (g.parentCode.toLowerCase().includes(q)) return true;

      const desc = (g.parentRow['Descrição'] ?? '').toLowerCase();
      if (desc.includes(q)) return true;

      return false;
    });
  }, [groups, search]);

  return (
    <div class="flex min-h-screen flex-col bg-white">
      <header class="sticky top-0 z-10 border-b border-gray-100 bg-white/95 backdrop-blur">
        <div class="mx-auto w-full max-w-7xl px-4 py-4 md:px-8">
          <div class="mb-4 flex items-center justify-between gap-4">
            <div>
              <p class="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Conteo de estoque
              </p>
              <h1 class="text-2xl font-bold text-gray-900">
                Productos
              </h1>
              <p class="mt-1 text-sm text-gray-500">
                {groups.length} {groups.length === 1 ? 'modelo cargado' : 'modelos cargados'}
              </p>
            </div>

              <button
                type="button"
                onClick={() => useStockStore.getState().reset()}
                class="min-h-touch rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 active:scale-[0.98]"
                aria-label="Cargar otro archivo"
              >
              Nuevo CSV
            </button>
          </div>

          <input
            type="search"
            inputMode="search"
            placeholder="Buscar por código o descripción"
            value={search}
            onInput={(e) => setSearch((e.target as HTMLInputElement).value)}
            class="min-h-touch w-full rounded-xl border-0 bg-gray-100 px-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
        </div>
      </header>

      <main class="mx-auto w-full max-w-7xl flex-1 px-4 py-4 md:px-8 md:py-8">
        {filtered.length === 0 && (
          <div class="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-400">
            Sin resultados
          </div>
        )}

        <ul class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((g) => {
            const img = firstImageUrl(g.parentRow);
            const desc = g.parentRow['Descrição'] ?? '';
            const changedCount = dirty[g.parentCode]?.size ?? 0;
            const isDirty = changedCount > 0;

            return (
              <li key={g.parentCode}>
                <button
                  type="button"
                  onClick={() => setActive(g.parentCode)}
                  class={`group w-full overflow-hidden rounded-3xl border bg-white text-left transition active:scale-[0.99] ${
                    isDirty
                      ? 'border-amber-300 bg-amber-50/40'
                      : 'border-gray-100 hover:border-gray-300'
                  }`}
                >
                  <div class="aspect-[4/3] w-full bg-gray-100">
                    {img && (
                      <img
                        src={img}
                        alt={desc || g.parentCode}
                        loading="lazy"
                        class="h-full w-full object-cover transition group-hover:scale-[1.02]"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    )}
                  </div>

                  <div class="p-4">
                    <div class="mb-2 flex items-start justify-between gap-3">
                      <div class="min-w-0">
                        <p class="font-mono text-xs font-semibold uppercase tracking-wide text-gray-500">
                          {g.parentCode}
                        </p>
                        <h2 class="mt-1 line-clamp-2 text-base font-bold text-gray-900">
                          {desc}
                        </h2>
                      </div>

                      <span class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-xl text-gray-500">
                        ›
                      </span>
                    </div>

                    <div class="mt-4 flex flex-wrap items-center gap-2">
                      <span class="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                        {g.childCodes.length}{' '}
                        {g.childCodes.length === 1 ? 'variación' : 'variaciones'}
                      </span>

                      {isDirty && (
                        <span class="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                          {changedCount} editadas
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </main>
    </div>
  );
}
