import type { ParseConfidence, ParsedDescricao, ParseStatus } from '../types';

const KNOWN_SIZES = ['PP', 'P', 'M', 'G', 'GG', 'XG', 'XGG', 'U', 'ÚNICO', 'UNICO'] as const;
const SIZE_SET = new Set(KNOWN_SIZES);

function normalizeSize(value: string): string {
  const normalized = value.trim().toUpperCase();
  if (normalized === 'UNICO') return 'ÚNICO';
  return normalized;
}

function buildResult(
  raw: string,
  status: ParseStatus,
  confidence: ParseConfidence,
  issues: string[] = []
): ParsedDescricao {
  return {
    raw,
    other: [],
    status,
    confidence,
    issues,
  };
}

function parseKeyValuePairs(input: string, separatorPattern: RegExp) {
  const entries = input
    .split(separatorPattern)
    .map((segment) => segment.trim())
    .filter(Boolean);

  const kv: Array<{ key: string; value: string }> = [];

  for (const entry of entries) {
    const idx = entry.indexOf(':');
    if (idx === -1) continue;
    const key = entry.slice(0, idx).trim().toUpperCase();
    const value = entry.slice(idx + 1).trim();
    if (!value) continue;
    kv.push({ key, value });
  }

  return kv;
}

function fillFromKeyValues(raw: string, kv: Array<{ key: string; value: string }>, detectedPattern: string): ParsedDescricao {
  const result = buildResult(raw, 'ok', 'high');
  result.detectedPattern = detectedPattern;

  for (const item of kv) {
    switch (item.key) {
      case 'COR':
        result.cor = item.value;
        break;
      case 'TAMANHO':
      case 'TAM':
      case 'TAMANHO/SIZE':
      case 'SIZE':
        result.tamanho = normalizeSize(item.value);
        break;
      default:
        result.other.push({ key: item.key, value: item.value });
    }
  }

  if (result.cor && result.tamanho) return result;

  result.status = 'warning';
  result.confidence = 'medium';
  result.issues.push('Descrição parcialmente interpretada.');
  return result;
}

function tryInferredPattern(raw: string, separatorPattern: RegExp, detectedPattern: string): ParsedDescricao | null {
  const parts = raw
    .split(separatorPattern)
    .map((p) => p.trim())
    .filter(Boolean);

  if (parts.length !== 2) return null;

  const maybeColor = parts[0];
  const maybeSize = normalizeSize(parts[1]);

  if (!SIZE_SET.has(maybeSize as (typeof KNOWN_SIZES)[number])) {
    return null;
  }

  return {
    raw,
    cor: maybeColor,
    tamanho: maybeSize,
    other: [],
    status: 'warning',
    confidence: 'medium',
    issues: ['Formato inferido. Revise a descrição para garantir consistência.'],
    detectedPattern,
  };
}

export function parseDescricao(rawInput: string): ParsedDescricao {
  const raw = (rawInput ?? '').trim();

  if (!raw) {
    return buildResult('', 'error', 'low', ['Descrição vazia.']);
  }

  const semicolonKeyValues = parseKeyValuePairs(raw, /\s*;\s*/);
  if (semicolonKeyValues.length > 0) {
    return fillFromKeyValues(raw, semicolonKeyValues, 'key-value-semicolon');
  }

  const slashKeyValues = parseKeyValuePairs(raw, /\s*\/\s*/);
  if (slashKeyValues.length > 0) {
    return fillFromKeyValues(raw, slashKeyValues, 'key-value-slash');
  }

  const inferredDash = tryInferredPattern(raw, /\s*-\s*/, 'inferred-dash');
  if (inferredDash) return inferredDash;

  const inferredSlash = tryInferredPattern(raw, /\s*\/\s*/, 'inferred-slash');
  if (inferredSlash) return inferredSlash;

  return buildResult(raw, 'error', 'low', ['Não foi possível identificar cor e tamanho na descrição.']);
}

export function formatParsedDescricao(p: ParsedDescricao): string {
  const parts: string[] = [];
  if (p.cor) parts.push(`Cor: ${p.cor}`);
  if (p.tamanho) parts.push(`Tamanho: ${p.tamanho}`);
  for (const o of p.other) parts.push(`${o.key}: ${o.value}`);
  return parts.join(' | ') || p.raw;
}
