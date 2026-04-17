interface TopbarProps {
  title: string;
}

export function Topbar({ title }: TopbarProps) {
  return (
    <header className="h-14 border-b border-gray-200 bg-white flex items-center px-6 lg:px-8 shrink-0">
      <h1 className="text-lg font-semibold text-gray-900 lg:ml-0 ml-10">{title}</h1>
    </header>
  );
}
