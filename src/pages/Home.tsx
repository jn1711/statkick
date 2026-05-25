import { useState, useEffect } from "react";
import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SportTicker from "@/components/SportTicker";
import FootballField from "@/components/FootballField";
import {
  Search,
  TrendingUp,
  AlertTriangle,
  Calendar,
  ChevronRight,
  Loader2,
  Shield,
  Swords,
  BarChart3,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { motion } from "framer-motion";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

const LEAGUE_COLORS: Record<number, string> = {
  1: "#00E701",
  2: "#A855F7",
  3: "#EF4444",
  4: "#F59E0B",
  5: "#3B82F6",
};

const PIE_COLORS = ["#00E701", "#3B82F6", "#EF4444"];

export default function Home() {
  const [selectedLeague, setSelectedLeague] = useState<number | undefined>();
  useEffect(() => {
    const handleScroll = () => {};
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const { data: leagues } = trpc.league.list.useQuery();
  const { data: matches, isLoading: matchesLoading } = trpc.match.list.useQuery(
    { leagueId: selectedLeague, status: "SCHEDULED" }
  );
  const { data: upsets, isLoading: upsetsLoading } = trpc.match.upsets.useQuery();
  const { data: trends } = trpc.league.trends.useQuery();

  // Global trends chart data
  const trendData = [
    { name: "Авг", homeWin: 42, draw: 25, cleanSheet: 28 },
    { name: "Сен", homeWin: 45, draw: 22, cleanSheet: 30 },
    { name: "Окт", homeWin: 48, draw: 20, cleanSheet: 32 },
    { name: "Ноя", homeWin: 44, draw: 24, cleanSheet: 29 },
    { name: "Дек", homeWin: 46, draw: 23, cleanSheet: 31 },
    { name: "Янв", homeWin: 43, draw: 26, cleanSheet: 27 },
    { name: "Фев", homeWin: 47, draw: 21, cleanSheet: 33 },
    { name: "Мар", homeWin: 45, draw: 24, cleanSheet: 30 },
    { name: "Апр", homeWin: 46, draw: 22, cleanSheet: 31 },
    { name: "Май", homeWin: 44, draw: 25, cleanSheet: 29 },
  ];

  const outcomeData = trends
    ? [
        { name: "Победа хоз.", value: trends.homeWinPercentage },
        { name: "Ничья", value: trends.drawPercentage },
        { name: "Победа гост.", value: 100 - trends.homeWinPercentage - trends.drawPercentage },
      ]
    : [
        { name: "Победа хоз.", value: 45 },
        { name: "Ничья", value: 25 },
        { name: "Победа гост.", value: 30 },
      ];

  return (
    <div className="min-h-screen bg-[#030B15]">
      <Header />

      {/* Hero Section with 3D Field */}
      <section className="relative h-screen w-full overflow-hidden">
        {/* 3D Background */}
        <div className="absolute inset-0 z-0">
          <FootballField />
        </div>

        {/* Overlay gradient */}
        <div className="absolute inset-0 z-[1] bg-gradient-to-b from-[#030B15]/70 via-transparent to-[#030B15]" />

        {/* Hero Content */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight">
              Прогнозы нового
              <br />
              <span className="neon-green">поколения</span>
            </h1>
            <p className="text-[#9CA3AF] text-base sm:text-lg mb-8 max-w-xl mx-auto">
              Big Data аналитика, математические модели и симуляция Монте-Карло для точного
              прогнозирования футбольных матчей.
            </p>

            {/* Search Panel */}
            <div className="bg-[#060F1D]/90 backdrop-blur-xl rounded-xl p-4 border border-[#0B192C] max-w-lg mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                  <select
                    className="w-full bg-[#030B15] border border-[#0B192C] rounded-lg pl-10 pr-4 py-2.5 text-sm text-white appearance-none focus:outline-none focus:border-[#00E701]/50"
                    value={selectedLeague || ""}
                    onChange={(e) => setSelectedLeague(e.target.value ? Number(e.target.value) : undefined)}
                  >
                    <option value="">Все лиги</option>
                    {leagues?.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                </div>
                <Link
                  to="/league/1"
                  className="flex items-center justify-center gap-2 bg-[#00E701] text-[#030B15] font-semibold px-6 py-2.5 rounded-lg hover:bg-[#00E701]/90 transition-all text-sm"
                >
                  <Search className="w-4 h-4" />
                  Анализировать
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="absolute bottom-24 left-1/2 -translate-x-1/2"
          >
            <div className="w-6 h-10 border-2 border-[#00E701]/30 rounded-full flex items-start justify-center p-1">
              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-1.5 h-1.5 bg-[#00E701] rounded-full"
              />
            </div>
          </motion.div>
        </div>

        {/* Sport Ticker */}
        <div className="absolute bottom-0 left-0 right-0 z-20">
          <SportTicker />
        </div>
      </section>

      {/* Dashboard Content */}
      <main className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        {/* Match Calendar */}
        <motion.section
          custom={0}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-[#00E701]" />
              <h2 className="text-xl font-bold text-white">Календарь матчей</h2>
            </div>
            <div className="flex gap-2">
              {leagues?.map((l) => (
                <button
                  key={l.id}
                  onClick={() => setSelectedLeague(selectedLeague === l.id ? undefined : l.id)}
                  className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all ${
                    selectedLeague === l.id
                      ? "text-[#030B15]"
                      : "text-[#9CA3AF] bg-[#060F1D] border border-[#0B192C] hover:text-white"
                  }`}
                  style={
                    selectedLeague === l.id
                      ? { backgroundColor: LEAGUE_COLORS[l.id] || "#00E701" }
                      : {}
                  }
                >
                  {l.country}
                </button>
              ))}
            </div>
          </div>

          {matchesLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#00E701]" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {matches?.slice(0, 9).map((match) => (
                <Link
                  key={match.id}
                  to={`/match/${match.id}`}
                  className="card-dark rounded-xl p-4 hover:border-[#00E701]/30 transition-all group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-[#9CA3AF]">
                      {new Date(match.matchDate).toLocaleDateString("ru-RU", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
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
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div
                        className="w-2 h-8 rounded-full"
                        style={{ backgroundColor: match.homeTeam.color || "#3B82F6" }}
                      />
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {match.homeTeam.shortName}
                        </p>
                        <p className="text-xs text-[#9CA3AF]">{match.homeTeam.name}</p>
                      </div>
                    </div>
                    <div className="text-center px-4">
                      {match.status === "FINISHED" ? (
                        <span className="text-lg font-bold text-[#00E701] font-mono-data">
                          {match.homeGoals}:{match.awayGoals}
                        </span>
                      ) : (
                        <span className="text-sm text-[#9CA3AF]">vs</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 flex-1 justify-end">
                      <div className="text-right">
                        <p className="text-sm font-semibold text-white">
                          {match.awayTeam.shortName}
                        </p>
                        <p className="text-xs text-[#9CA3AF]">{match.awayTeam.name}</p>
                      </div>
                      <div
                        className="w-2 h-8 rounded-full"
                        style={{ backgroundColor: match.awayTeam.color || "#3B82F6" }}
                      />
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-[#0B192C] flex items-center justify-between text-xs text-[#9CA3AF]">
                    <span>xG: {match.homeXg} - {match.awayXg}</span>
                    <ChevronRight className="w-4 h-4 text-[#00E701] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </motion.section>

        {/* Upset Alert Section */}
        <motion.section
          custom={1}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
        >
          <div className="flex items-center gap-3 mb-6">
            <AlertTriangle className="w-5 h-5 text-[#A855F7]" />
            <h2 className="text-xl font-bold text-white">Детектор сенсаций</h2>
            <span className="text-xs text-[#9CA3AF] ml-2">
              Матчи с аномальной вероятностью аутсайдера
            </span>
          </div>

          {upsetsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-[#A855F7]" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {upsets?.map((match) => (
                <Link
                  key={match.id}
                  to={`/match/${match.id}`}
                  className="gradient-border-purple card-dark rounded-xl p-5 hover:scale-[1.02] transition-transform"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs text-[#A855F7] font-medium">
                      Вероятность аутсайдера
                    </span>
                    <span className="text-2xl font-bold text-[#00E701] font-mono-data">
                      {match.modelProbability}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-center">
                      <p className="text-lg font-bold text-white">
                        {match.homeTeam.shortName}
                      </p>
                      <p className="text-xs text-[#9CA3AF]">{match.homeTeam.name}</p>
                    </div>
                    <div className="text-center px-3">
                      <Swords className="w-5 h-5 text-[#A855F7] mx-auto mb-1" />
                      <span className="text-xs text-[#9CA3AF]">vs</span>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-white">
                        {match.awayTeam.shortName}
                      </p>
                      <p className="text-xs text-[#9CA3AF]">{match.awayTeam.name}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="w-full h-2 bg-[#0B192C] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${match.modelProbability}%`,
                          background: `linear-gradient(90deg, #A855F7, #00E701)`,
                        }}
                      />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </motion.section>

        {/* Global Trends Section */}
        <motion.section
          custom={2}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
        >
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-5 h-5 text-[#3B82F6]" />
            <h2 className="text-xl font-bold text-white">Глобальные тренды</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Stats Cards */}
            <div className="lg:col-span-1 space-y-4">
              <div className="card-dark rounded-xl p-5">
                <div className="flex items-center gap-3 mb-2">
                  <Shield className="w-5 h-5 text-[#00E701]" />
                  <span className="text-sm text-[#9CA3AF]">% домашних побед</span>
                </div>
                <p className="text-3xl font-bold text-[#00E701] font-mono-data">
                  {trends?.homeWinPercentage ?? 45}%
                </p>
              </div>
              <div className="card-dark rounded-xl p-5">
                <div className="flex items-center gap-3 mb-2">
                  <BarChart3 className="w-5 h-5 text-[#3B82F6]" />
                  <span className="text-sm text-[#9CA3AF]">Средняя результативность</span>
                </div>
                <p className="text-3xl font-bold text-[#3B82F6] font-mono-data">
                  {trends?.avgGoalsPerMatch ?? "2.8"}
                </p>
                <span className="text-xs text-[#9CA3AF]">гола за матч</span>
              </div>
              <div className="card-dark rounded-xl p-5">
                <div className="flex items-center gap-3 mb-2">
                  <Shield className="w-5 h-5 text-[#A855F7]" />
                  <span className="text-sm text-[#9CA3AF]">Сухие матчи</span>
                </div>
                <p className="text-3xl font-bold text-[#A855F7] font-mono-data">
                  {trends?.cleanSheetPercentage ?? 30}%
                </p>
              </div>
            </div>

            {/* Charts */}
            <div className="lg:col-span-2 card-dark rounded-xl p-5">
              <h3 className="text-sm font-semibold text-[#9CA3AF] mb-4">
                Динамика по месяцам
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorHome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00E701" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#00E701" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorDraw" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#0B192C" />
                  <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
                  <YAxis stroke="#9CA3AF" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#060F1D",
                      border: "1px solid #0B192C",
                      borderRadius: "8px",
                      color: "#F9FAFB",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="homeWin"
                    name="Дом. победы %"
                    stroke="#00E701"
                    fillOpacity={1}
                    fill="url(#colorHome)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="draw"
                    name="Ничьи %"
                    stroke="#3B82F6"
                    fillOpacity={1}
                    fill="url(#colorDraw)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>

              <div className="mt-6 flex justify-center">
                <ResponsiveContainer width={300} height={200}>
                  <PieChart>
                    <Pie
                      data={outcomeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {outcomeData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
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
                <div className="flex flex-col justify-center gap-2 ml-4">
                  {outcomeData.map((item, i) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: PIE_COLORS[i] }}
                      />
                      <span className="text-xs text-[#9CA3AF]">
                        {item.name}: {item.value}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.section>
      </main>

      <Footer />
    </div>
  );
}
