type PageHeaderProps = {
  title: string;
  description: string;
};

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="mb-6 border-b border-[#d7c7aa]/70 pb-5">
      <div className="mb-3 h-1 w-14 rounded-full bg-gradient-to-r from-[#8a6f3c] via-[#314f60] to-transparent" />
      <h1 className="text-2xl font-semibold tracking-normal text-stone-950 sm:text-3xl">{title}</h1>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-600">{description}</p>
    </div>
  );
}
