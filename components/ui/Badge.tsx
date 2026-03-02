import { getCategoryConfig } from '@/lib/categories';
import { Category } from '@/lib/types';

export default function CategoryBadge({ category }: { category: Category }) {
  const cfg = getCategoryConfig(category);
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.bgColor} ${cfg.textColor}`}
    >
      <span>{cfg.icon}</span>
      {category}
    </span>
  );
}
