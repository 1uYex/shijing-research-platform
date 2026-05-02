type PageHeaderProps = {
  title: string;
  description: string;
};

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="mb-6 border-b border-stone-200 pb-5">
      <h1 className="text-2xl font-semibold tracking-normal text-stone-950 sm:text-3xl">{title}</h1>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-600">{description}</p>
    </div>
  );
}
