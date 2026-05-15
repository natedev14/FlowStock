import { firstImageUrl } from './grouping';
import { parseDescricao } from './parseDescricao';
import type { CsvRow } from '../types';

export interface ColorSizeCell {
  size: string;
  childCode: string;
  stock: number;
  isDirty: boolean;
}

export interface ColorGroup {
  color: string;
  imageUrl: string | null;
  totalStock: number;
  sizes: ColorSizeCell[];
  status: 'pending' | 'edited' | 'reviewed';
}

export interface BuildColorGroupsInput {
  rows: CsvRow[];
  indexByCode: Map<string, number>;
  childCodes: string[];
  dirtyChildren?: Set<string>;
}

const SIZE_ORDER = ['PP', 'P', 'M', 'G', 'GG', 'XG', 'XGG', 'U', 'ÚNICO'];
const SIZE_RANK = new Map(SIZE_ORDER.map((s, i) => [s, i]));

export function buildColorGroups(input: BuildColorGroupsInput): ColorGroup[] {
  const { rows, indexByCode, childCodes, dirtyChildren } = input;
  const dirtySet = dirtyChildren ?? new Set<string>();

  const byColor = new Map<string, ColorGroup>();

  for (const childCode of childCodes) {
    const idx = indexByCode.get(childCode);
    if (idx === undefined) continue;

    const row = rows[idx];
    const parsed = parseDescricao(row['Descrição'] ?? '');
    const color = parsed.cor || 'Sem cor';
    const size = parsed.tamanho || 'ÚNICO';
    const stock = parseStock(row['Estoque']);
    const image = firstImageUrl(row);

    const group = byColor.get(color) ?? {
      color,
      imageUrl: image,
      totalStock: 0,
      sizes: [],
      status: 'pending' as const,
    };

    if (!group.imageUrl && image) {
      group.imageUrl = image;
    }

    group.sizes.push({
      size,
      childCode,
      stock,
      isDirty: dirtySet.has(childCode),
    });

    group.totalStock += stock;

    if (dirtySet.has(childCode)) {
      group.status = 'edited';
    }

    byColor.set(color, group);
  }

  return Array.from(byColor.values())
    .map((group) => ({
      ...group,
      sizes: sortSizes(group.sizes),
    }))
    .sort((a, b) => a.color.localeCompare(b.color, 'pt-BR'));
}

function sortSizes(sizes: ColorSizeCell[]): ColorSizeCell[] {
  return [...sizes].sort((a, b) => {
    const rankA = SIZE_RANK.get(a.size);
    const rankB = SIZE_RANK.get(b.size);

    if (rankA !== undefined && rankB !== undefined) return rankA - rankB;
    if (rankA !== undefined) return -1;
    if (rankB !== undefined) return 1;

    return a.size.localeCompare(b.size, 'pt-BR');
  });
}

function parseStock(value: string | undefined): number {
  const normalized = String(value ?? '').trim().replace(',', '.');
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return Math.floor(parsed);
}
