import { useLocation } from "react-router-dom";

export default function Header() {
  const location = useLocation();

  const isDashboard = location.pathname.startsWith("/dashboard");

  return (
    <header className="border-b bg-background">
      <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
        <h1 className="font-semibold">
          Reku
          {isDashboard && (
            <span className="ml-2 text-sm text-muted-foreground">
              · Dashboard Cafe
            </span>
          )}
        </h1>
      </div>
    </header>
  );
}
