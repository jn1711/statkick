import { useState } from "react";
import { useParams, Link } from "react-router";
import { trpc } from "@/providers/trpc";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  ArrowLeft,
  Loader2,
  Target,
  Battery,
  Brain,
  GitCompare,
  TrendingUp,
  Shield,
  Zap,
  SlidersHorizontal,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { motion } from "framer-motion";

// Pie chart colors for match prediction

export default function MatchDetail() {
  const { id } = useParams<{ id: string }>();
  const matchId = Number(id);
  const [tacticalFocus, setTacticalFocus] = useState(50);

  const { data: match, isLoading: matchLoading } = trpc.match.getById.useQuery({ id: matchId });
  const { data: prediction, isLoading: predLoading } = trpc.match.predict.useQuery(
    { matchId },
    { enabled: !isNaN(matchId) }
  );

  // Form data (last 5 matches simulation)
  const formData = [
    { match: "М1", xG: 2.1, xGA: 0.8 },
    { match: "М2", xG: 1.8, xGA: 1.2 },
    { match: "М3", xG: 2.5, xGA: 0.5 },
    { match: "М4", xG: 1.4, xGA: 1.0 },
    { match: "М5", xG: 1.9, xGA: 0.7 },
  ];

  const awayFormData = [
    { match: "М1", xG: 1.2, xGA: 1.5 },
    { match: "М2", xG: 1.8, xGA: 0.9 },
    { match: "М3", xG: 1.0, xGA: 2.0 },
    { match: "М4", xG: 1.5, xGA: 1.1 },
    { match: "М5", xG: 1.3, xGA: 1.4 },
  ];

  const predictionData = prediction
    ? [
        { name: "П1 (Хоз.)", value: prediction.probabilities.homeWin, color: "#00E701" },
        { name: "X (Ничья)", value: prediction.probabilities.draw, color: "#3B82F6" },
        { name: "П2 (Гости)", value: prediction.probabilities.awayWin, color: "#EF4444" },
      ]
    : [
        { name: "П1 (Хоз.)", value: 45, color: "#00E701" },
        { name: "X (Ничья)", value: 25, color: "#3B82F6" },
        { name: "П2 (Гости)", value: 30, color: "#EF4444" },
      ];

  const adjustedXg = prediction
    ? {
        home: (parseFloat(prediction.homeXg) * (1 + (tacticalFocus - 50) / 200)).toFixed(2),
        away: (parseFloat(prediction.awayXg) * (1 - (tacticalFocus - 50) / 300)).toFixed(2),
      }
    : { home: "1.80", away: "1.20" };

  if (matchLoading) {
    return (
      <div className="min-h-screen bg-[#030B15] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#00E701]" />
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-[#030B15] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#9CA3AF] text-lg mb-4">Матч не найден</p>
          <Link to="/" className="text-[#00E701] hover:underline">
            Вернуться на главную
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030B15]">
      <Header />

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {/* Back button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-[#9CA3AF] hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Назад к матчам</span>
        </Link>

        {/* Match Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-dark rounded-2xl p-6 sm:p-10 mb-8"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 text-center sm:text-left">
              {match.homeTeam?.logoUrl ? (
                <img src={match.homeTeam.logoUrl} alt="" className="w-14 h-14 object-contain" />
              ) : (
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                  style={{ backgroundColor: match.homeTeam?.color || "#3B82F6" }}
                >
                  {match.homeTeam?.shortName?.[0]}
                </div>
              )}
              <div>
                <p className="text-xl sm:text-2xl font-bold text-white">
                  {match.homeTeam?.name}
                </p>
                <p className="text-sm text-[#9CA3AF]">Хозяева</p>
              </div>
            </div>

            <div className="text-center">
              {match.status === "FINISHED" ? (
                <div className="text-4xl font-bold text-[#00E701] font-mono-data mb-1">
                  {match.homeGoals} : {match.awayGoals}
                </div>
              ) : (
                <div className="text-2xl font-bold text-[#3B82F6] mb-1">vs</div>
              )}
              <p className="text-xs text-[#9CA3AF]">
                {new Date(match.matchDate).toLocaleDateString("ru-RU", {
                  day: "numeric",
                  month: "long",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              <span
                className="inline-block mt-2 text-xs px-3 py-1 rounded-full font-medium"
                style={{
                  color: match.status === "SCHEDULED" ? "#3B82F6" : "#00E701",
                  backgroundColor:
                    match.status === "SCHEDULED"
                      ? "rgba(59,130,246,0.1)"
                      : "rgba(0,231,1,0.1)",
                }}
              >
                {match.status === "SCHEDULED" ? "Предстоит" : "Завершён"}
              </span>
            </div>

            <div className="flex items-center gap-4 text-center sm:text-right">
              <div className="sm:text-right">
                <p className="text-xl sm:text-2xl font-bold text-white">
                  {match.awayTeam?.name}
                </p>
                <p className="text-sm text-[#9CA3AF]">Гости</p>
              </div>
              {match.awayTeam?.logoUrl ? (
                <img src={match.awayTeam.logoUrl} alt="" className="w-14 h-14 object-contain" />
              ) : (
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                  style={{ backgroundColor: match.awayTeam?.color || "#EF4444" }}
                >
                  {match.awayTeam?.shortName?.[0]}
                </div>
              )}
            </div>
          </div>

          {/* Odds */}
          {match.oddsHome && (
            <div className="mt-6 pt-6 border-t border-[#0B192C] flex items-center justify-center gap-8">
              <div className="text-center">
                <p className="text-xs text-[#9CA3AF]">П1</p>
                <p className="text-lg font-bold text-[#00E701] font-mono-data">{match.oddsHome}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-[#9CA3AF]">X</p>
                <p className="text-lg font-bold text-[#3B82F6] font-mono-data">{match.oddsDraw}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-[#9CA3AF]">П2</p>
                <p className="text-lg font-bold text-[#EF4444] font-mono-data">{match.oddsAway}</p>
              </div>
            </div>
          )}
        </motion.div>

        {/* H2H + Prediction Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* H2H Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card-dark rounded-xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <GitCompare className="w-5 h-5 text-[#3B82F6]" />
              <h2 className="text-lg font-bold text-white">Head-to-Head</h2>
            </div>

            <div className="space-y-4 mb-6">
              {match.h2hHistory && match.h2hHistory.length > 0 ? (
                match.h2hHistory.map((h2h, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-2 border-b border-[#0B192C] last:border-0"
                  >
                    <span className="text-xs text-[#9CA3AF]">
                      {new Date(h2h.matchDate).toLocaleDateString("ru-RU")}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-white font-medium">
                        {match.homeTeam?.shortName}
                      </span>
                      <span className="text-sm font-bold text-[#00E701] font-mono-data">
                        {h2h.homeGoals} : {h2h.awayGoals}
                      </span>
                      <span className="text-sm text-white font-medium">
                        {match.awayTeam?.shortName}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-[#9CA3AF] text-sm">
                  Нет исторических встреч
                </div>
              )}
            </div>

            {/* Form Charts */}
            <h3 className="text-sm font-semibold text-[#9CA3AF] mb-3">Форма (последние 5 матчей)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-[#00E701] mb-2">{match.homeTeam?.shortName} — xG</p>
                <ResponsiveContainer width="100%" height={120}>
                  <BarChart data={formData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#0B192C" />
                    <XAxis dataKey="match" stroke="#9CA3AF" fontSize={10} />
                    <YAxis stroke="#9CA3AF" fontSize={10} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#060F1D",
                        border: "1px solid #0B192C",
                        borderRadius: "6px",
                        fontSize: "12px",
                      }}
                    />
                    <Bar dataKey="xG" fill="#00E701" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div>
                <p className="text-xs text-[#3B82F6] mb-2">{match.awayTeam?.shortName} — xG</p>
                <ResponsiveContainer width="100%" height={120}>
                  <BarChart data={awayFormData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#0B192C" />
                    <XAxis dataKey="match" stroke="#9CA3AF" fontSize={10} />
                    <YAxis stroke="#9CA3AF" fontSize={10} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#060F1D",
                        border: "1px solid #0B192C",
                        borderRadius: "6px",
                        fontSize: "12px",
                      }}
                    />
                    <Bar dataKey="xG" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>

          {/* AI Prediction */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card-dark rounded-xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <Brain className="w-5 h-5 text-[#00E701]" />
              <h2 className="text-lg font-bold text-white">Прогноз ИИ</h2>
            </div>

            {predLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[#00E701]" />
              </div>
            ) : (
              <>
                {/* Probability Pie */}
                <div className="flex items-center justify-center mb-6">
                  <ResponsiveContainer width={200} height={200}>
                    <PieChart>
                      <Pie
                        data={predictionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={4}
                        dataKey="value"
                        stroke="none"
                      >
                        {predictionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#060F1D",
                          border: "1px solid #0B192C",
                          borderRadius: "8px",
                          color: "#F9FAFB",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="ml-4 space-y-2">
                    {predictionData.map((item) => (
                      <div key={item.name} className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm text-[#9CA3AF]">
                          {item.name}: <strong className="text-white">{item.value}%</strong>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Most Likely Score */}
                {prediction?.mostLikelyScore && (
                  <div className="bg-[#060F1D] rounded-xl p-4 border border-[#00E701]/20 mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4 text-[#00E701]" />
                      <span className="text-sm text-[#9CA3AF]">Наиболее вероятный счёт</span>
                    </div>
                    <p className="text-3xl font-bold text-[#00E701] font-mono-data text-center">
                      {prediction.mostLikelyScore.score}
                    </p>
                    <p className="text-xs text-[#9CA3AF] text-center mt-1">
                      Вероятность: {prediction.mostLikelyScore.probability}%
                    </p>
                  </div>
                )}

                {/* Expected xG */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-xs text-[#9CA3AF] mb-1">
                      {match.homeTeam?.shortName} xG
                    </p>
                    <p className="text-2xl font-bold text-[#00E701] font-mono-data">
                      {prediction?.homeXg || "1.80"}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-[#9CA3AF] mb-1">
                      {match.awayTeam?.shortName} xG
                    </p>
                    <p className="text-2xl font-bold text-[#3B82F6] font-mono-data">
                      {prediction?.awayXg || "1.20"}
                    </p>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </div>

        {/* Fatigue Index */}
        {prediction?.fatigueIndex && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card-dark rounded-xl p-6 mb-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <Battery className="w-5 h-5 text-[#F59E0B]" />
              <h2 className="text-lg font-bold text-white">Индекс усталости</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Home Team */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-white font-medium">
                    {match.homeTeam?.shortName}
                  </span>
                  <span
                    className="text-sm font-bold font-mono-data"
                    style={{ color: prediction.fatigueIndex.home.color }}
                  >
                    {(prediction.fatigueIndex.home.value * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="w-full h-3 bg-[#0B192C] rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${prediction.fatigueIndex.home.value * 100}%`,
                      backgroundColor: prediction.fatigueIndex.home.color,
                    }}
                  />
                </div>
                <p className="text-xs text-[#9CA3AF]">
                  {prediction.fatigueIndex.home.description} • Отдых: {prediction.fatigueIndex.home.restDays} дн. • Перелёты: {prediction.fatigueIndex.home.flightKm} км
                </p>
              </div>

              {/* Away Team */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-white font-medium">
                    {match.awayTeam?.shortName}
                  </span>
                  <span
                    className="text-sm font-bold font-mono-data"
                    style={{ color: prediction.fatigueIndex.away.color }}
                  >
                    {(prediction.fatigueIndex.away.value * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="w-full h-3 bg-[#0B192C] rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${prediction.fatigueIndex.away.value * 100}%`,
                      backgroundColor: prediction.fatigueIndex.away.color,
                    }}
                  />
                </div>
                <p className="text-xs text-[#9CA3AF]">
                  {prediction.fatigueIndex.away.description} • Отдых: {prediction.fatigueIndex.away.restDays} дн. • Перелёты: {prediction.fatigueIndex.away.flightKm} км
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tactical Simulator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card-dark rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <SlidersHorizontal className="w-5 h-5 text-[#A855F7]" />
            <h2 className="text-lg font-bold text-white">Интерактивный симулятор тактики</h2>
          </div>

          <div className="max-w-xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#3B82F6]" />
                <span className="text-xs text-[#3B82F6] font-medium">Глубокая оборона</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#00E701] font-medium">Тотальная атака</span>
                <Zap className="w-4 h-4 text-[#00E701]" />
              </div>
            </div>

            <input
              type="range"
              min={0}
              max={100}
              value={tacticalFocus}
              onChange={(e) => setTacticalFocus(Number(e.target.value))}
              className="w-full h-2 bg-[#0B192C] rounded-full appearance-none cursor-pointer accent-[#00E701]"
              style={{
                background: `linear-gradient(to right, #3B82F6 ${tacticalFocus}%, #0B192C ${tacticalFocus}%)`,
              }}
            />

            <div className="flex items-center justify-center mt-4">
              <span className="text-sm text-[#9CA3AF]">
                Фокус: <strong className="text-white">{tacticalFocus}%</strong> атака
              </span>
            </div>

            {/* Adjusted xG preview */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-[#060F1D] rounded-lg p-3 text-center border border-[#00E701]/20">
                <p className="text-xs text-[#9CA3AF] mb-1">Корректировка xG хозяев</p>
                <p className="text-xl font-bold text-[#00E701] font-mono-data">
                  {adjustedXg.home}
                </p>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-[#00E701]" />
                  <span className="text-xs text-[#00E701]">
                    +{(((Number(adjustedXg.home) / Number(prediction?.homeXg || 1.8)) - 1) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="bg-[#060F1D] rounded-lg p-3 text-center border border-[#3B82F6]/20">
                <p className="text-xs text-[#9CA3AF] mb-1">Корректировка xG гостей</p>
                <p className="text-xl font-bold text-[#3B82F6] font-mono-data">
                  {adjustedXg.away}
                </p>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-[#EF4444] rotate-180" />
                  <span className="text-xs text-[#EF4444]">
                    {(((Number(adjustedXg.away) / Number(prediction?.awayXg || 1.2)) - 1) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
