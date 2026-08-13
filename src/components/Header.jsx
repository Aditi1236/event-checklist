import { Link } from "react-router-dom";
import { ClipboardCheck, Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 border-b border-paper-line bg-paper/85 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate text-paper-soft">
            <ClipboardCheck size={18} />
          </span>
          <span className="font-display text-xl font-semibold tracking-tight text-ink">
            Roster
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <span className="hidden font-mono text-xs uppercase tracking-[0.14em] text-ink-soft sm:block">
            Club Event Checklists
          </span>
          <button
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-paper-line text-ink-soft transition-colors hover:text-emerald hover:border-emerald/50"
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </div>
    </header>
  );
}
