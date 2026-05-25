import { Link, useLocation } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { Activity, BookOpen, Shuffle, Trophy, Menu, X, LogOut, User } from "lucide-react";
import { useState, useEffect } from "react";

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { label: "Матчи", path: "/", icon: Activity },
    { label: "Симулятор", path: "/league/1", icon: Trophy },
    { label: "Методология", path: "/methodology", icon: BookOpen },
    { label: "Трансферы", path: "/transfer", icon: Shuffle },
  ];

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#030B15]/90 backdrop-blur-md border-b border-[#0B192C]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <span className="text-xl font-bold tracking-tight text-white">
              Stat<span className="text-[#00E701]">K</span>ick
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive(item.path)
                    ? "text-[#00E701] bg-[#00E701]/10"
                    : "text-[#9CA3AF] hover:text-white hover:bg-white/5"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-[#9CA3AF]">
                  <User className="w-4 h-4" />
                  <span className="text-white">{user?.name || "User"}</span>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-[#9CA3AF] hover:text-[#EF4444] transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Выйти
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-[#9CA3AF] border border-[#00E701]/30 rounded-lg hover:border-[#00E701] hover:text-white transition-all"
                >
                  Войти
                </Link>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium bg-[#00E701] text-[#030B15] rounded-lg hover:bg-[#00E701]/90 transition-all"
                >
                  Прогнозы
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-white p-2"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden py-4 border-t border-[#0B192C]">
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    isActive(item.path)
                      ? "text-[#00E701] bg-[#00E701]/10"
                      : "text-[#9CA3AF] hover:text-white hover:bg-white/5"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              ))}
              {isAuthenticated ? (
                <button
                  onClick={() => {
                    logout();
                    setMobileOpen(false);
                  }}
                  className="flex items-center gap-2 px-4 py-3 text-sm text-[#EF4444] hover:bg-white/5 rounded-lg"
                >
                  <LogOut className="w-4 h-4" />
                  Выйти
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 text-sm text-[#00E701] hover:bg-[#00E701]/10 rounded-lg"
                >
                  <User className="w-4 h-4" />
                  Войти
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
