type EmptyStateProps = {
  title: string;
  description: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-[#cdbf9e] bg-white/68 px-6 py-10 text-center shadow-sm">
      <div className="text-sm font-semibold text-stone-800">{title}</div>
      <p className="mt-2 text-sm text-stone-500">{description}</p>
    </div>
  );
}
