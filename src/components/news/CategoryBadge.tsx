interface CategoryBadgeProps {
  label: string;
  className?: string;
}

export function CategoryBadge({ label, className = '' }: CategoryBadgeProps) {
  return (
    <span className={`inline-flex items-center text-[10px] font-extrabold uppercase tracking-widest text-primary ${className}`}>
      {label}
    </span>
  );
}