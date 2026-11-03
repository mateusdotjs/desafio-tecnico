import { Link, NavLink, Outlet } from "react-router";

function navLinkClassName({ isActive }: { isActive: boolean }) {
  return isActive
    ? "font-semibold text-sky-600"
    : "text-slate-600 hover:text-slate-900";
}

export default function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link
            to="/"
            className="text-lg font-bold text-sky-600 hover:text-sky-700"
          >
            Agendamento de Exames
          </Link>
          <div className="flex items-center gap-6">
            <nav className="flex items-center gap-4 text-sm">
              <NavLink to="/" end className={navLinkClassName}>
                Início
              </NavLink>
              <NavLink to="/agendar" className={navLinkClassName}>
                Agendar
              </NavLink>
            </nav>
            <div className="flex shrink-0 items-center gap-2" />
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
