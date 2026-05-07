import { z } from 'zod';
import type { CsvRow } from './types';

/**
 * Validamos la PRESENCIA de columnas clave, no la forma completa de las 59+.
 * El CSV de Bling sigue siendo la fuente de verdad.
 */
export const REQUIRED_COLUMNS = [
  'Código',
  'Código Pai',
  'Descrição',
  'Estoque',
  'URL Imagens Externas',
] as const;

export function validateHeaders(fields: string[]): { ok: true } | { ok: false; missing: string[] } {
  const set = new Set(fields);
  const missing = REQUIRED_COLUMNS.filter((c) => !set.has(c));
  if (missing.length > 0) return { ok: false, missing };
  return { ok: true };
}

export function validateRows(rows: CsvRow[]): { ok: true } | { ok: false; message: string } {
  const seenCodes = new Set<string>();
  const duplicateCodes = new Set<string>();
  const emptyCodeRows: number[] = [];

  rows.forEach((row, index) => {
    const code = normalizeCode(row['Código']);

    if (!code) {
      emptyCodeRows.push(index + 2);
      return;
    }

    if (seenCodes.has(code)) {
      duplicateCodes.add(code);
    }

    seenCodes.add(code);
  });

  if (emptyCodeRows.length > 0) {
    return {
      ok: false,
      message: `Hay filas sin Código. Revisa las filas: ${emptyCodeRows.slice(0, 8).join(', ')}.`,
    };
  }

  if (duplicateCodes.size > 0) {
    return {
      ok: false,
      message: `Hay códigos duplicados: ${Array.from(duplicateCodes).slice(0, 8).join(', ')}. Corrige el archivo antes de contar.`,
    };
  }

  const parents = rows.filter(isParentRow);

  if (parents.length === 0) {
    return {
      ok: false,
      message: 'No se encontró un producto padre. El archivo debe tener una fila con Código Pai vacío o 0.',
    };
  }

  if (parents.length > 1) {
    return {
      ok: false,
      message: `Este editor está optimizado para un producto por archivo. Este archivo contiene ${parents.length} productos padre. Carga solo un producto a la vez.`,
    };
  }

  const parentCode = normalizeCode(parents[0]['Código']);
  const children = rows.filter((row) => !isParentRow(row));

  if (children.length === 0) {
    return {
      ok: false,
      message: 'Este producto no tiene variaciones para contar.',
    };
  }

  const orphanChildren = children.filter((row) => normalizeCode(row['Código Pai']) !== parentCode);

  if (orphanChildren.length > 0) {
    return {
      ok: false,
      message: `Hay variaciones que no pertenecen al producto padre ${parentCode}: ${orphanChildren
        .slice(0, 8)
        .map((row) => normalizeCode(row['Código']))
        .join(', ')}.`,
    };
  }

  return { ok: true };
}

function normalizeCode(value: string | undefined): string {
  return String(value ?? '').trim();
}

function isParentRow(row: CsvRow): boolean {
  const parentCode = normalizeCode(row['Código Pai']);
  return parentCode === '' || parentCode === '0';
}

// Schema mínimo de fila, útil para debug o futuras pruebas unitarias.
export const minRowSchema = z.object({
  'Código': z.string().min(1),
  'Código Pai': z.string(),
  'Estoque': z.string(),
});

export type MinRow = z.infer<typeof minRowSchema>;
