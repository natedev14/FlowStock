import type { ColorGroup } from '../lib/buildColorGroups';

interface ColorCardProps {
  group: ColorGroup;
  onClick: () => void;
}

const STATUS_LABEL: Record<ColorGroup['status'], string> = {
  pending: 'Pendente',
  edited: 'Editado',
  reviewed: 'Revisado',
};

const STATUS_CLASS: Record<ColorGroup['status'], string> = {
  pending: 'bg-amber-100 text-amber-800',
  edited: 'bg-emerald-100 text-emerald-800',
  reviewed: 'bg-blue-100 text-blue-800',
};

export function ColorCard({ group, onClick }: ColorCardProps) {
  const sizesLabel = group.sizes.map((s) => s.size).join(' ');

  return (
    <button
      type="button"
      onClick={onClick}
      class="w-full overflow-hidden rounded-3xl border border-slate-200 bg-white text-left shadow-sm transition-transform active:scale-[0.98]"
    >
      <div class="flex h-[170px] items-center justify-center bg-slate-50 p-4">
        {group.imageUrl ? (
          <img src={group.imageUrl} alt={group.color} class="h-full w-full object-contain" loading="lazy" />
        ) : (
          <span class="text-sm font-medium text-slate-400">Sem imagem</span>
        )}
      </div>

      <div class="flex min-h-[74px] flex-col gap-2 px-4 py-3">
        <div class="flex items-center justify-between gap-3">
          <p class="truncate text-lg font-bold text-slate-900">{group.color}</p>
          <span class={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_CLASS[group.status]}`}>
            {STATUS_LABEL[group.status]}
          </span>
        </div>

        <p class="text-sm text-slate-600">{group.totalStock} peças · {sizesLabel || 'ÚNICO'}</p>
      </div>
    </button>
  );
}
