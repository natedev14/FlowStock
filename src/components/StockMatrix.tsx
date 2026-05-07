import { useMemo, useState } from 'preact/hooks';
import { useStockStore } from '../store/useStockStore';
import { firstImageUrl } from '../lib/grouping';
import { parseDescricao } from '../lib/parseDescricao';

type MatrixCell = {
  childCode: string;
  stock: number;
  isDirty: boolean;
};

type MatrixRow = {
  color: string;
  image: string | null;
  cells: Record<string, MatrixCell>;
};

interface Props {
  parentCode: string;
  childCodes: string[];
}

const SIZE_ORDER = ['PP', 'P', 'M', 'G', 'GG', 'XG', 'XGG', 'U', 'ÚNICO'];

export function StockMatrix({ parentCode, childCodes }: Props) {
  const [openImage, setOpenImage] = useState<{ src: string; label: string } | null>(null);

  const rows = useStockStore((s) => s.rows);
  const indexByCode = useStockStore((s) => s.indexByCode);
  const dirtyByParent = useStockStore((s) => s.dirtyByParent);
  const updateChildStock = useStockStore((s) => s.updateChildStock);

  const dirtySet = dirtyByParent[parentCode] ?? new Set<string>();

  const { colors, sizes } = useMemo(() => {
    const byColor = new Map<string, MatrixRow>();
    const sizeSet = new Set<string>();

    for (const childCode of childCodes) {
      const idx = indexByCode.get(childCode);
      if (idx === undefined) continue;

      const row = rows[idx];
      const parsed = parseDescricao(row['Descrição'] ?? '');
      const color = parsed.cor || 'Sin color';
      const size = parsed.tamanho || 'ÚNICO';
      const stock = parseStock(row['Estoque']);

      sizeSet.add(size);

      const existing = byColor.get(color) ?? {
        color,
        image: firstImageUrl(row),
        cells: {},
      };

      if (!existing.image) {
        existing.image = firstImageUrl(row);
      }

      existing.cells[size] = {
        childCode,
        stock,
        isDirty: dirtySet.has(childCode),
      };

      byColor.set(color, existing);
    }

    return {
      colors: Array.from(byColor.values()),
      sizes: sortSizes(Array.from(sizeSet)),
    };
  }, [childCodes, dirtySet, indexByCode, rows]);

  function updateCell(cell: MatrixCell, value: string) {
    const parsedValue = parseInt(value, 10);
    const safeValue = isFinite(parsedValue) && parsedValue >= 0 ? parsedValue : 0;
    updateChildStock(parentCode, cell.childCode, String(safeValue));
  }

  if (colors.length === 0) {
    return (
      <div class="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center text-sm text-gray-400">
        Sin variaciones para mostrar
      </div>
    );
  }

  return (
    <>
      <section class="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
        <div class="border-b border-gray-100 px-4 py-4 md:px-6">
          <p class="text-xs font-semibold uppercase tracking-wide text-blue-600">
            Matriz de conteo
          </p>
          <h2 class="mt-1 text-lg font-bold text-gray-900">
            Color × Talla
          </h2>
          <p class="mt-1 text-sm text-gray-500">
            Toca una imagen para verla grande y escribe el conteo en cada talla.
          </p>
        </div>

        <div class="hidden overflow-x-auto md:block">
          <table class="w-full border-collapse text-sm">
            <thead>
              <tr class="border-b border-gray-200 bg-slate-50">
                <th class="min-w-[240px] bg-slate-50 px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                  Color
                </th>
                {sizes.map((size) => (
                  <th key={size} class="min-w-[140px] px-3 py-3 text-center text-sm font-bold text-gray-700">
                    {size}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {colors.map((colorRow) => (
                <tr key={colorRow.color} class="border-b border-gray-100 last:border-b-0">
                  <td class="bg-white px-4 py-3 align-middle">
                    <ColorLabel
                      color={colorRow.color}
                      image={colorRow.image}
                      onOpenImage={setOpenImage}
                    />
                  </td>

                  {sizes.map((size) => {
                    const cell = colorRow.cells[size];

                    return (
                      <td key={size} class="border-l border-gray-100 px-3 py-3 text-center align-middle">
                        {cell ? (
                          <StockInput
                            value={cell.stock}
                            isDirty={cell.isDirty}
                            onInput={(value) => updateCell(cell, value)}
                          />
                        ) : (
                          <span class="text-gray-300">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div class="grid gap-3 p-3 md:hidden">
          {colors.map((colorRow) => (
            <article
              key={colorRow.color}
              class="rounded-2xl border border-gray-200 bg-slate-50 p-3"
            >
              <div class="mb-3 flex items-center justify-between gap-3">
                <ColorLabel
                  color={colorRow.color}
                  image={colorRow.image}
                  onOpenImage={setOpenImage}
                />
              </div>

              <div class="grid grid-cols-3 gap-2">
                {sizes.map((size) => {
                  const cell = colorRow.cells[size];

                  return (
                    <div key={size}>
                      <p class="mb-1 text-center text-xs font-bold text-gray-500">{size}</p>
                      {cell ? (
                        <StockInput
                          value={cell.stock}
                          isDirty={cell.isDirty}
                          onInput={(value) => updateCell(cell, value)}
                        />
                      ) : (
                        <div class="flex min-h-fat items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-300">
                          —
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </article>
          ))}
        </div>
      </section>

      {openImage && (
        <div
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setOpenImage(null)}
        >
          <button
            type="button"
            class="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-2xl font-bold text-white"
            onClick={() => setOpenImage(null)}
            aria-label="Cerrar imagen"
          >
            ×
          </button>

          <img
            src={openImage.src}
            alt={openImage.label}
            class="max-h-[90vh] max-w-[95vw] rounded-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          <div class="absolute bottom-4 left-4 right-4 rounded-2xl bg-black/50 p-3 text-center text-sm font-medium text-white">
            {openImage.label}
          </div>
        </div>
      )}
    </>
  );
}

function ColorLabel({
  color,
  image,
  onOpenImage,
}: {
  color: string;
  image: string | null;
  onOpenImage: (image: { src: string; label: string }) => void;
}) {
  return (
    <div class="flex items-center gap-3">
      <button
        type="button"
        disabled={!image}
        onClick={() => image && onOpenImage({ src: image, label: color })}
        class="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-2xl bg-white ring-1 ring-gray-200 disabled:cursor-default"
        aria-label={`Ampliar imagen de ${color}`}
      >
        {image && (
          <img
            src={image}
            alt={color}
            loading="lazy"
            class="h-full w-full object-contain p-1"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        )}
      </button>

      <div class="min-w-0">
        <p class="truncate text-sm font-bold text-gray-900">{color}</p>
        {image && <p class="text-xs font-medium text-blue-600">Ampliar imagen</p>}
      </div>
    </div>
  );
}

function StockInput({
  value,
  isDirty,
  onInput,
}: {
  value: number;
  isDirty: boolean;
  onInput: (value: string) => void;
}) {
  return (
    <input
      type="number"
      inputMode="numeric"
      min="0"
      step="1"
      value={String(value)}
      onInput={(e) => onInput((e.target as HTMLInputElement).value)}
      class={`min-h-fat w-full rounded-xl border-2 bg-white text-center text-xl font-bold text-gray-900 focus:outline-none focus:ring-4 md:text-2xl ${
        isDirty
          ? 'border-amber-300 bg-amber-50 focus:border-amber-400 focus:ring-amber-100'
          : 'border-gray-200 focus:border-blue-600 focus:ring-blue-100'
      }`}
    />
  );
}

function parseStock(value: string | undefined): number {
  const parsed = Number(String(value ?? '0').replace(',', '.'));
  return Number.isFinite(parsed) && parsed >= 0 ? Math.floor(parsed) : 0;
}

function sortSizes(sizes: string[]): string[] {
  return sizes.sort((a, b) => {
    const aIndex = SIZE_ORDER.indexOf(a.toUpperCase());
    const bIndex = SIZE_ORDER.indexOf(b.toUpperCase());

    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;

    return a.localeCompare(b, 'pt-BR');
  });
}
