import { create } from 'zustand';
import type { CsvMeta, CsvRow, Mode, ParentGroup } from '../types';
import { buildGroups } from '../lib/grouping';
import { clearAllSessions, loadSession, saveSession } from '../lib/storage';

interface State {
  // ——— Carga ———
  loaded: boolean;
  meta: CsvMeta | null;
  // Almacenamiento plano: orden de inserción preservado → export respeta orden original
  rows: CsvRow[];
  // Índice rápido: Código -> posición en rows[]
  indexByCode: Map<string, number>;
  groups: ParentGroup[];

  // ——— UI ———
  mode: Mode;
  activeParentCode: string | null;
  search: string;
  dirtyByParent: Record<string, Set<string>>; // parentCode -> set de childCodes tocados

  // ——— Acciones ———
  loadData: (rows: CsvRow[], meta: CsvMeta) => void;
  reset: () => void;
  setMode: (m: Mode) => void;
  setActiveParent: (code: string | null) => void;
  setSearch: (q: string) => void;

  // Modifica el campo Estoque de un hijo. newValue viene ya como string
  // (UI lo validará como integer >= 0).
  updateChildStock: (parentCode: string, childCode: string, newValue: string) => void;

  // Aplica delta (+1/-1) sobre el valor actual de Estoque del hijo.
  bumpChildStock: (parentCode: string, childCode: string, delta: number) => void;

  // Persiste la sesión del padre actual en localStorage.
  persistActive: () => void;

  // Intenta rehidratar la sesión persistida del padre que se acaba de activar.
  // Se llama al cambiar de padre — si había overrides los re-aplica.
  rehydrateActive: () => void;
}

export const useStockStore = create<State>((set, get) => ({
  loaded: false,
  meta: null,
  rows: [],
  indexByCode: new Map(),
  groups: [],

  mode: 'quick',
  activeParentCode: null,
  search: '',
  dirtyByParent: {},

  loadData: (rows, meta) => {
    // Decisión respuesta #1: limpiar TODAS las sesiones anteriores al cargar nuevo CSV.
    clearAllSessions();

    const indexByCode = new Map<string, number>();
    rows.forEach((r, i) => {
      const code = (r['Código'] ?? '').trim();
      if (code) indexByCode.set(code, i);
    });

    const groups = buildGroups(rows);

    set({
      loaded: true,
      meta,
      rows,
      indexByCode,
      groups,
      mode: 'quick',
      activeParentCode: null,
      search: '',
      dirtyByParent: {},
    });
  },

  reset: () => {
    clearAllSessions();
    set({
      loaded: false,
      meta: null,
      rows: [],
      indexByCode: new Map(),
      groups: [],
      mode: 'quick',
      activeParentCode: null,
      search: '',
      dirtyByParent: {},
    });
  },

  setMode: (m) => set({ mode: m }),

  setActiveParent: (code) => {
    set({ activeParentCode: code, search: '' });
    // Rehidratar sesión si existe
    if (code) get().rehydrateActive();
  },

  setSearch: (q) => set({ search: q }),

  updateChildStock: (parentCode, childCode, newValue) => {
    const { rows, indexByCode, dirtyByParent } = get();
    const idx = indexByCode.get(childCode);
    if (idx === undefined) return;

    // Sanitizar: integer >= 0, mantener formato simple (sin decimales en UI)
    const clean = sanitizeStock(newValue);

    // Mutación inmutable: clonamos la fila, actualizamos Estoque
    const updated = { ...rows[idx], Estoque: clean };
    const newRows = rows.slice();
    newRows[idx] = updated;

    // Marcar dirty
    const dirty = { ...dirtyByParent };
    const set_ = new Set(dirty[parentCode] ?? []);
    set_.add(childCode);
    dirty[parentCode] = set_;

    set({ rows: newRows, dirtyByParent: dirty });

    // Autosave debounced a nivel app (acá solo triggerea; el debounce lo hace VariationCard)
    schedulePersist(parentCode);
  },

  bumpChildStock: (parentCode, childCode, delta) => {
    const { rows, indexByCode } = get();
    const idx = indexByCode.get(childCode);
    if (idx === undefined) return;
    const current = parseInt(rows[idx]['Estoque'] ?? '0', 10) || 0;
    const next = Math.max(0, current + delta); // PRD §6: no negativos
    get().updateChildStock(parentCode, childCode, String(next));
  },

  persistActive: () => {
    const { activeParentCode, rows, indexByCode, mode, dirtyByParent } = get();
    if (!activeParentCode) return;
    const group = get().groups.find((g) => g.parentCode === activeParentCode);
    if (!group) return;

    const overrides: Record<string, string> = {};
    for (const childCode of group.childCodes) {
      const idx = indexByCode.get(childCode);
      if (idx === undefined) continue;
      overrides[childCode] = rows[idx]['Estoque'] ?? '0';
    }

    saveSession({
      parentCode: activeParentCode,
      savedAt: Date.now(),
      mode,
      estoqueOverrides: overrides,
      dirtyChildren: Array.from(dirtyByParent[activeParentCode] ?? []),
    });
  },

  rehydrateActive: () => {
    const { activeParentCode, rows, indexByCode, dirtyByParent } = get();
    if (!activeParentCode) return;
    const stored = loadSession(activeParentCode);
    if (!stored) return;

    const newRows = rows.slice();
    for (const [childCode, value] of Object.entries(stored.estoqueOverrides)) {
      const idx = indexByCode.get(childCode);
      if (idx === undefined) continue;
      newRows[idx] = { ...newRows[idx], Estoque: value };
    }

    const dirty = { ...dirtyByParent };
    dirty[activeParentCode] = new Set(stored.dirtyChildren);

    set({ rows: newRows, mode: stored.mode, dirtyByParent: dirty });
  },
}));

// ——— Helpers ———

function sanitizeStock(raw: string): string {
  // PRD §6: formatos como "10.0" deben tratarse como integer en la UI.
  // Aceptamos "10", "10.0", "10,0" y devolvemos el integer como string.
  const trimmed = (raw ?? '').trim();
  if (trimmed === '') return '0';
  // Reemplazar coma por punto, parsear como float, truncar a integer
  const num = parseFloat(trimmed.replace(',', '.'));
  if (!isFinite(num) || num < 0) return '0';
  return String(Math.floor(num));
}

// Debouncer global para autosave. Una sola entrada en vuelo por padre.
const saveTimers = new Map<string, number>();
function schedulePersist(parentCode: string) {
  const existing = saveTimers.get(parentCode);
  if (existing) clearTimeout(existing);
  const t = window.setTimeout(() => {
    saveTimers.delete(parentCode);
    // Solo persistir si este padre sigue siendo el activo
    const state = useStockStore.getState();
    if (state.activeParentCode === parentCode) {
      state.persistActive();
    }
  }, 300);
  saveTimers.set(parentCode, t);
}
