import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#030B15] flex items-center justify-center">
      <div className="text-center">
        <p className="text-8xl font-bold text-[#00E701] font-mono-data mb-4">404</p>
        <h1 className="text-2xl font-bold text-white mb-2">Страница не найдена</h1>
        <p className="text-[#9CA3AF] mb-8">
          Запрашиваемая страница не существует или была удалена.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-[#00E701] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Вернуться на главную
        </Link>
      </div>
    </div>
  );
}
