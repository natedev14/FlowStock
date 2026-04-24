import { z } from 'zod';

/**
 * Zod valida la PRESENCIA de columnas clave, no la forma completa de las 59+.
 * Filosofía R2 del PRD: la app nunca debe hardcodear el esquema completo;
 * el CSV manda. Solo exigimos lo mínimo para que la app pueda funcionar.
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

// Schema de fila mínimo (para validación por-fila opcional en debug).
// No lo usamos en producción porque ralentiza sin aportar: confiamos en el header check.
export const minRowSchema = z.object({
  'Código': z.string().min(1),
  'Código Pai': z.string(),
  'Estoque': z.string(),
});

export type MinRow = z.infer<typeof minRowSchema>;
