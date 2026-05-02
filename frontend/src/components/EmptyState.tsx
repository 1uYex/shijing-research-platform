type EmptyStateProps = {
  title: string;
  description: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="rounded-md border border-dashed border-stone-300 bg-white px-6 py-10 text-center">
      <div className="text-sm font-semibold text-stone-800">{title}</div>
      <p className="mt-2 text-sm text-stone-500">{description}</p>
    </div>
  );
}
