import { parseDescricao } from './parseDescricao';
import type { CsvRow, ParentGroup, ParsedDescricao } from '../types';

export interface VariationParseIssue {
  childCode: string;
  rawDescricao: string;
  parsed: ParsedDescricao;
}

export interface VariationParseReport {
  total: number;
  ok: VariationParseIssue[];
  warnings: VariationParseIssue[];
  errors: VariationParseIssue[];
}

export function validateVariations(
  rows: CsvRow[],
  group: ParentGroup,
  indexByCode: Map<string, number>
): VariationParseReport {
  const report: VariationParseReport = {
    total: group.childCodes.length,
    ok: [],
    warnings: [],
    errors: [],
  };

  for (const childCode of group.childCodes) {
    const idx = indexByCode.get(childCode);

    if (idx === undefined) {
      report.errors.push({
        childCode,
        rawDescricao: '',
        parsed: {
          raw: '',
          other: [],
          status: 'error',
          confidence: 'low',
          issues: ['Variação não encontrada no CSV.'],
        },
      });
      continue;
    }

    const row = rows[idx];
    const rawDescricao = row['Descrição'] ?? '';
    const parsed = parseDescricao(rawDescricao);

    const issue: VariationParseIssue = { childCode, rawDescricao, parsed };

    if (parsed.status === 'ok') report.ok.push(issue);
    else if (parsed.status === 'warning') report.warnings.push(issue);
    else report.errors.push(issue);
  }

  return report;
}
