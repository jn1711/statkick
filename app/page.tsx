"use client";

import { useEffect, useState } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
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

const LEAGUES = [
  { id: "premier-league", name: "Premier League", country: "England" },
  { id: "la-liga", name: "La Liga", country: "Spain" },
  { id: "bundesliga", name: "Bundesliga", country: "Germany" },
  { id: "serie-a", name: "Serie A", country: "Italy" },
  { id: "ligue-1", name: "Ligue 1", country: "France" },
  { id: "champions-league", name: "UCL", country: "Europe" },
  { id: "world-cup-2026", name: "World Cup 2026", country: "FIFA" },
];

const LEAGUE_COLORS: Record<string, string> = {
  "premier-league": "#00E701",
  "la-liga": "#A855F7",
  "bundesliga": "#EF4444",
  "serie-a": "#F59E0B",
  "ligue-1": "#3B82F6",
  "champions-league": "#FEBE10",
  "world-cup-2026": "#00E701",
};

const PIE_COLORS = ["#00E701", "#3B82F6", "#EF4444"];

interface MatchCard {
  id: string;
  homeTeam: { name: string; shortName?: string };
  awayTeam: { name: string; shortName?: string };
  date: string;
  status?: string;
}

export default function HomePage() {
  const [selectedLeague, setSelectedLeague] = useState<string | undefined>();
  const [matches, setMatches] = useState<MatchCard[]>([]);
  const [loaded, setLoaded] = useState(false);
  const matchesLoading = !loaded;

  const activeLeague = selectedLeague || LEAGUES[0].id;

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    fetch(`/api/league/${activeLeague}/matches`, { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (!cancelled) {
          setMatches(Array.isArray(data) ? data : []);
          setLoaded(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setMatches([]);
          setLoaded(true);
        }
      });
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [activeLeague]);

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

  const outcomeData = [
    { name: "Победа хоз.", value: 45 },
    { name: "Ничья", value: 25 },
    { name: "Победа гост.", value: 30 },
  ];

  return (
    <div className="min-h-screen bg-[#030B15]">
      <Header />

      {/* Hero Section */}
      <section className="relative h-screen w-full overflow-hidden">
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#030B15] via-[#0B192C] to-[#030B15]" />
        <div className="absolute inset-0 z-[1] bg-gradient-to-b from-[#030B15]/70 via-transparent to-[#030B15]" />

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

            <div className="bg-[#060F1D]/90 backdrop-blur-xl rounded-xl p-4 border border-[#0B192C] max-w-2xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                  <select
                    className="w-full bg-[#030B15] border border-[#0B192C] rounded-lg pl-10 pr-4 py-2.5 text-sm text-white appearance-none focus:outline-none focus:border-[#00E701]/50"
                    value={activeLeague}
                    onChange={(e) => setSelectedLeague(e.target.value)}
                  >
                    {LEAGUES.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                </div>
                <a
                  href={`/league/${activeLeague}`}
                  className="flex items-center justify-center gap-2 bg-[#00E701] text-[#030B15] font-semibold px-6 py-2.5 rounded-lg hover:bg-[#00E701]/90 transition-all text-sm"
                >
                  <Search className="w-4 h-4" />
                  Анализировать
                </a>
              </div>
            </div>
          </motion.div>

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
          <div className="w-full overflow-hidden bg-[#060F1D] border-t border-[#0B192C] py-3">
            <div className="ticker-wrapper overflow-hidden whitespace-nowrap">
              <div className="ticker-content">
                {["MCI 2:1 LIV", "ARS 3:0 MUN", "RMA 2:2 BAR", "INT 1:0 ACM", "BAY 4:1 BVB"].map(
                  (score, i) => (
                    <span key={i} className="mx-8 text-sm font-mono-data text-[#9CA3AF]">
                      <span className="text-[#00E701]">{score}</span> {" \u2022 "}
                    </span>
                  )
                )}
                {["MCI 2:1 LIV", "ARS 3:0 MUN", "RMA 2:2 BAR", "INT 1:0 ACM", "BAY 4:1 BVB"].map(
                  (score, i) => (
                    <span key={`dup-${i}`} className="mx-8 text-sm font-mono-data text-[#9CA3AF]">
                      <span className="text-[#00E701]">{score}</span> {" \u2022 "}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>
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
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-[#00E701]" />
              <h2 className="text-xl font-bold text-white">Календарь матчей</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {LEAGUES.map((l) => (
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
                  {l.country === "Europe" ? "UEFA" : l.country}
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
              {matches.slice(0, 9).map((match) => (
                <a
                  key={match.id}
                  href={`/match/${match.id}`}
                  className="card-dark rounded-xl p-4 hover:border-[#00E701]/30 transition-all group block"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-[#9CA3AF]">
                      {new Date(match.date).toLocaleDateString("ru-RU", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{
                        color: match.status === "FINISHED" ? "#00E701" : "#3B82F6",
                        backgroundColor:
                          match.status === "FINISHED"
                            ? "rgba(0,231,1,0.1)"
                            : "rgba(59,130,246,0.1)",
                      }}
                    >
                      {match.status === "FINISHED" ? "Завершён" : "Предстоит"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-2 h-8 rounded-full bg-[#00E701]" />
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {match.homeTeam.shortName || match.homeTeam.name}
                        </p>
                      </div>
                    </div>
                    <div className="text-center px-4">
                      <span className="text-sm text-[#9CA3AF]">vs</span>
                    </div>
                    <div className="flex items-center gap-3 flex-1 justify-end">
                      <div className="text-right">
                        <p className="text-sm font-semibold text-white">
                          {match.awayTeam.shortName || match.awayTeam.name}
                        </p>
                      </div>
                      <div className="w-2 h-8 rounded-full bg-[#3B82F6]" />
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-[#0B192C] flex items-center justify-between text-xs text-[#9CA3AF]">
                    <span>Прогнозный календарь</span>
                    <ChevronRight className="w-4 h-4 text-[#00E701] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </a>
              ))}
            </div>
          )}

          {matches.length === 0 && !matchesLoading && (
            <div className="text-center py-12">
              <p className="text-[#9CA3AF]">Выберите лигу для просмотра матчей</p>
            </div>
          )}
        </motion.section>

        {/* Upset Detector Section */}
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { home: "Burnley", away: "Man City", prob: 28 },
              { home: "Lecce", away: "Inter", prob: 22 },
              { home: "Mainz", away: "Bayern", prob: 19 },
            ].map((match, idx) => (
              <div
                key={idx}
                className="gradient-border-purple card-dark rounded-xl p-5 hover:scale-[1.02] transition-transform"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-[#A855F7] font-medium">
                    Вероятность аутсайдера
                  </span>
                  <span className="text-2xl font-bold text-[#00E701] font-mono-data">
                    {match.prob}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-center">
                    <p className="text-lg font-bold text-white">{match.home}</p>
                  </div>
                  <div className="text-center px-3">
                    <Swords className="w-5 h-5 text-[#A855F7] mx-auto mb-1" />
                    <span className="text-xs text-[#9CA3AF]">vs</span>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-white">{match.away}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="w-full h-2 bg-[#0B192C] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${match.prob}%`,
                        background: "linear-gradient(90deg, #A855F7, #00E701)",
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
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
            <div className="lg:col-span-1 space-y-4">
              <div className="card-dark rounded-xl p-5">
                <div className="flex items-center gap-3 mb-2">
                  <Shield className="w-5 h-5 text-[#00E701]" />
                  <span className="text-sm text-[#9CA3AF]">% домашних побед</span>
                </div>
                <p className="text-3xl font-bold text-[#00E701] font-mono-data">45%</p>
              </div>
              <div className="card-dark rounded-xl p-5">
                <div className="flex items-center gap-3 mb-2">
                  <BarChart3 className="w-5 h-5 text-[#3B82F6]" />
                  <span className="text-sm text-[#9CA3AF]">Средняя результативность</span>
                </div>
                <p className="text-3xl font-bold text-[#3B82F6] font-mono-data">2.8</p>
                <span className="text-xs text-[#9CA3AF]">гола за матч</span>
              </div>
              <div className="card-dark rounded-xl p-5">
                <div className="flex items-center gap-3 mb-2">
                  <Shield className="w-5 h-5 text-[#A855F7]" />
                  <span className="text-sm text-[#9CA3AF]">Сухие матчи</span>
                </div>
                <p className="text-3xl font-bold text-[#A855F7] font-mono-data">30%</p>
              </div>
            </div>

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
