"use client";

import { Activity, BookOpen, Shuffle, Trophy, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

export default function Header() {
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
    { label: "Турниры", path: "/tournaments", icon: BookOpen },
    { label: "Трансферы", path: "/transfer", icon: Shuffle },
  ];

  const currentPath = typeof window !== "undefined" ? window.location.pathname : "/";

  const isActive = (path: string) => {
    if (path === "/") return currentPath === "/";
    return currentPath.startsWith(path);
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
          <a href="/" className="flex items-center gap-2 shrink-0">
            <span className="text-xl font-bold tracking-tight text-white">
              Stat<span className="text-[#00E701]">K</span>ick
            </span>
          </a>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <a
                key={item.path}
                href={item.path}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive(item.path)
                    ? "text-[#00E701] bg-[#00E701]/10"
                    : "text-[#9CA3AF] hover:text-white hover:bg-white/5"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            <a
              href="/login"
              className="px-4 py-2 text-sm font-medium text-[#9CA3AF] border border-[#00E701]/30 rounded-lg hover:border-[#00E701] hover:text-white transition-all"
            >
              Войти
            </a>
            <a
              href="/login"
              className="px-4 py-2 text-sm font-medium bg-[#00E701] text-[#030B15] rounded-lg hover:bg-[#00E701]/90 transition-all"
            >
              Прогнозы
            </a>
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-white p-2"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden py-4 border-t border-[#0B192C]">
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => (
                <a
                  key={item.path}
                  href={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    isActive(item.path)
                      ? "text-[#00E701] bg-[#00E701]/10"
                      : "text-[#9CA3AF] hover:text-white hover:bg-white/5"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
