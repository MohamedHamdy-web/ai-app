"use client";

export default function Layout({
  sidebar,
  children,
}: {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.16),_transparent_26%),radial-gradient(circle_at_80%_10%,_rgba(34,211,238,0.12),_transparent_26%),linear-gradient(135deg,_#06131c_0%,_#0d1724_48%,_#142235_100%)] text-white">
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col gap-6 px-4 py-4 lg:flex-row lg:px-6 lg:py-6">
        <aside className="w-full shrink-0 lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)] lg:w-[22rem]">
          <div className="h-full overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.045] shadow-2xl shadow-black/25 backdrop-blur-xl">
            <div className="h-full overflow-y-auto p-4 sm:p-5">{sidebar}</div>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-4 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-6 lg:min-h-[calc(100vh-3rem)] lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
