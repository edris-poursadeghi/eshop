import SidebarWrapper from '../../shared/components/sidebar/sidebar';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <section className="flex h-full bg-black min-h-screen">
      {/* sidebar */}
      <aside className="w-[280px] min-w-[250px] max-w-[300px] border-r border-r-slate-800 text-wrap p-4 text-white">
        <div className="sticky top-0">
          <SidebarWrapper />
        </div>
      </aside>

      {/* Main conent area */}

      <main className="flex-1">
        <div className="overflow-auto">{children}</div>
      </main>
    </section>
  );
}
