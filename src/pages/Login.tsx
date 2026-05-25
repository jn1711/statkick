import { Link } from "react-router";
import { LogIn, ArrowLeft } from "lucide-react";

function getOAuthUrl() {
  const kimiAuthUrl = import.meta.env.VITE_KIMI_AUTH_URL;
  const appID = import.meta.env.VITE_APP_ID;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  const url = new URL(`${kimiAuthUrl}/api/oauth/authorize`);
  url.searchParams.set("client_id", appID);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "profile");
  url.searchParams.set("state", state);

  return url.toString();
}

export default function Login() {
  return (
    <div className="min-h-screen bg-[#030B15] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Back button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-[#9CA3AF] hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">На главную</span>
        </Link>

        {/* Login Card */}
        <div className="card-dark rounded-2xl p-8 border border-[#0B192C]">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">
              Stat<span className="text-[#00E701]">K</span>ick
            </h1>
            <p className="text-sm text-[#9CA3AF]">
              Войдите для доступа к расширенной аналитике
            </p>
          </div>

          <button
            onClick={() => {
              window.location.href = getOAuthUrl();
            }}
            className="w-full flex items-center justify-center gap-3 bg-[#00E701] text-[#030B15] font-semibold py-3 px-6 rounded-xl hover:bg-[#00E701]/90 transition-all"
          >
            <LogIn className="w-5 h-5" />
            Войти через Kimi
          </button>

          <div className="mt-6 text-center">
            <p className="text-xs text-[#9CA3AF]/60">
              Авторизуясь, вы соглашаетесь с условиями использования
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
