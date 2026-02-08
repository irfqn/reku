import { useLocation } from "react-router-dom";
import logo from "/Logo_Reku.png"; // sesuaikan path

export default function Header() {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith("/dashboard");

  return (
    <header className="relative z-10">
      <div className="relative">
        {/* gradient strip */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#2A1545] via-[#3B1C5A] to-[#2A1545] opacity-95" />

        {/* glow overlay */}
        <div className="absolute inset-0 bg-purple-600/10 blur-2xl" />

        <div className="relative max-w-7xl mx-auto px-8 py-5 flex items-center justify-between border-b border-[#3E1F5C]">
          {/* logo + title */}
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt="Reku Logo"
              className="h-8 w-auto object-contain"
            />

            <h1 className="font-semibold text-white tracking-wide text-lg">
              Reku
              {isDashboard && (
                <span className="ml-2 text-sm text-white/50">
                  · Dashboard Cafe
                </span>
              )}
            </h1>
          </div>
        </div>
      </div>
    </header>
  );
}
