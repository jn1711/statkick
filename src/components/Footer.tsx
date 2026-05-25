import { Github, MessageCircle } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-[#0B192C] bg-[#030B15]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-white">
              Stat<span className="text-[#00E701]">K</span>ick
            </span>
          </div>

          <nav className="flex items-center gap-6 text-sm text-[#9CA3AF]">
            <a href="#" className="hover:text-white transition-colors">О продукте</a>
            <a href="#" className="hover:text-white transition-colors">API</a>
            <a href="/methodology" className="hover:text-white transition-colors">Методология</a>
            <a href="#" className="hover:text-white transition-colors">Конфиденциальность</a>
          </nav>

          <div className="flex items-center gap-4">
            <a
              href="#"
              className="text-[#9CA3AF] hover:text-white transition-colors"
            >
              <Github className="w-5 h-5" />
            </a>
            <a
              href="#"
              className="text-[#9CA3AF] hover:text-white transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
            </a>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-[#0B192C] text-center text-xs text-[#9CA3AF]/60">
          StatKick 2026 — Аналитическая платформа футбольных прогнозов на основе Big Data
        </div>
      </div>
    </footer>
  );
}
