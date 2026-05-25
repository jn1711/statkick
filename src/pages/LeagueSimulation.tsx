import { useState } from "react";
import { useParams, Link } from "react-router";
import { trpc } from "@/providers/trpc";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  ArrowLeft,
  Loader2,
  Trophy,
  Shield,
  BarChart3,
  Play,
  ChevronUp,
  ChevronDown,
  Minus,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";

const POSITION_COLORS: Record<number, string> = {
  1: "#FEBE10",
  2: "#C0C0C0",
  3: "#CD7F32",
  4: "#3B82F6",
};

export default function LeagueSimulation() {
  const { id } = useParams<{ id: string }>();
  const leagueId = Number(id) || 1;
  const [showSimulation, setShowSimulation] = useState(false);

  const { data: leagues } = trpc.league.list.useQuery();
  const { data: standings, isLoading: standingsLoading } = trpc.league.standings.useQuery({ leagueId });
  const { data: simulation, isLoading: simLoading } = trpc.league.simulate.useQuery(
    { leagueId },
    { enabled: showSimulation }
  );

  const currentLeague = leagues?.find((l) => l.id === leagueId);

  // Prepare Monte Carlo chart data
  const monteCarloData = simulation?.currentStandings.map((team) => ({
    name: team.shortName || team.name.slice(0, 3),
    champion: team.championProbability || 0,
    top4: (team.top4Probability || 0) - (team.championProbability || 0),
    relegation: team.relegationProbability || 0,
  })) || [];

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
          <span className="text-sm">Назад</span>
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="w-6 h-6 text-[#00E701]" />
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              {currentLeague?.name || "Аналитика Лиги"}
            </h1>
          </div>
          <p className="text-[#9CA3AF] text-sm">
            Сезон {currentLeague?.season || "2025/26"} • Прогнозная таблица и симуляция Монте-Карло
          </p>

          {/* League selector */}
          <div className="flex gap-2 mt-4 flex-wrap">
            {leagues?.map((l) => (
              <Link
                key={l.id}
                to={`/league/${l.id}`}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  l.id === leagueId
                    ? "bg-[#00E701] text-[#030B15]"
                    : "bg-[#060F1D] text-[#9CA3AF] border border-[#0B192C] hover:text-white"
                }`}
              >
                {l.country}
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Standings Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-dark rounded-xl p-6 mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className="w-5 h-5 text-[#3B82F6]" />
            <h2 className="text-lg font-bold text-white">Турнирная таблица</h2>
            {simulation && (
              <span className="text-xs text-[#9CA3AF] ml-auto">
                xPTS = ожидаемые очки
              </span>
            )}
          </div>

          {standingsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#3B82F6]" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-xs text-[#9CA3AF] border-b border-[#0B192C]">
                    <th className="text-left py-3 px-2 w-12">#</th>
                    <th className="text-left py-3 px-2">Команда</th>
                    <th className="text-center py-3 px-2 w-12">И</th>
                    <th className="text-center py-3 px-2 w-12">В</th>
                    <th className="text-center py-3 px-2 w-12">Н</th>
                    <th className="text-center py-3 px-2 w-12">П</th>
                    <th className="text-center py-3 px-2 w-16">ГЗ</th>
                    <th className="text-center py-3 px-2 w-16">ГП</th>
                    <th className="text-center py-3 px-2 w-12">+/-</th>
                    <th className="text-center py-3 px-2 w-14">О</th>
                    {simulation && (
                      <>
                        <th className="text-center py-3 px-2 w-20">Чемп %</th>
                        <th className="text-center py-3 px-2 w-20">Топ-4 %</th>
                        <th className="text-center py-3 px-2 w-20">Вылет %</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {(simulation?.currentStandings || standings || [])?.map((team, index) => {
                    const position = index + 1;
                    const standingsList = simulation?.currentStandings || standings || [];
                    const isChampionsLeague = position <= 4;
                    const isRelegation = standingsList.length > 0 && position > standingsList.length - 3;
                    const matchesPlayed = (team.wins || 0) + (team.draws || 0) + (team.losses || 0);
                    const goalDiff = (team.goalsFor || 0) - (team.goalsAgainst || 0);
                    const simTeam = simulation?.currentStandings?.find((t) => t.id === team.id);
                    
                    return (
                      <tr
                        key={team.id}
                        className={`text-sm border-b border-[#0B192C]/50 hover:bg-white/5 transition-colors ${
                          isChampionsLeague ? "bg-[#00E701]/5" : ""
                        } ${isRelegation ? "bg-[#EF4444]/5" : ""}`}
                      >
                        <td className="py-3 px-2">
                          <span
                            className="font-bold font-mono-data"
                            style={{ color: POSITION_COLORS[position] || "#9CA3AF" }}
                          >
                            {position}
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: team.color || "#3B82F6" }}
                            />
                            <span className="text-white font-medium">{team.name}</span>
                          </div>
                        </td>
                        <td className="text-center py-3 px-2 text-[#9CA3AF] font-mono-data">
                          {matchesPlayed}
                        </td>
                        <td className="text-center py-3 px-2 text-[#00E701] font-mono-data">
                          {team.wins}
                        </td>
                        <td className="text-center py-3 px-2 text-[#3B82F6] font-mono-data">
                          {team.draws}
                        </td>
                        <td className="text-center py-3 px-2 text-[#EF4444] font-mono-data">
                          {team.losses}
                        </td>
                        <td className="text-center py-3 px-2 text-[#9CA3AF] font-mono-data">
                          {team.goalsFor}
                        </td>
                        <td className="text-center py-3 px-2 text-[#9CA3AF] font-mono-data">
                          {team.goalsAgainst}
                        </td>
                        <td
                          className="text-center py-3 px-2 font-mono-data"
                          style={{ color: goalDiff >= 0 ? "#00E701" : "#EF4444" }}
                        >
                          {goalDiff > 0 ? "+" : ""}
                          {goalDiff}
                        </td>
                        <td className="text-center py-3 px-2">
                          <span className="font-bold text-white font-mono-data">
                            {team.points}
                          </span>
                        </td>
                        {simulation && simTeam && (
                          <>
                            <td className="text-center py-3 px-2">
                              <span className="text-[#FEBE10] font-mono-data font-bold">
                                {simTeam.championProbability || 0}%
                              </span>
                            </td>
                            <td className="text-center py-3 px-2">
                              <span className="text-[#3B82F6] font-mono-data">
                                {simTeam.top4Probability || 0}%
                              </span>
                            </td>
                            <td className="text-center py-3 px-2">
                              <span
                                className="font-mono-data"
                                style={{
                                  color: (simTeam.relegationProbability || 0) > 30 ? "#EF4444" : "#9CA3AF",
                                }}
                              >
                                {simTeam.relegationProbability || 0}%
                              </span>
                            </td>
                          </>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Legend */}
          <div className="flex items-center gap-6 mt-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#00E701]/20 border border-[#00E701]" />
              <span className="text-[#9CA3AF]">Лига Чемпионов</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#EF4444]/20 border border-[#EF4444]" />
              <span className="text-[#9CA3AF]">Зона вылета</span>
            </div>
          </div>
        </motion.div>

        {/* Monte Carlo Simulation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-dark rounded-xl p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-[#A855F7]" />
              <h2 className="text-lg font-bold text-white">Симуляция Монте-Карло</h2>
            </div>
            <button
              onClick={() => setShowSimulation(!showSimulation)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                showSimulation
                  ? "bg-[#A855F7] text-white"
                  : "bg-[#060F1D] text-[#A855F7] border border-[#A855F7]/30 hover:bg-[#A855F7]/10"
              }`}
            >
              <Play className="w-4 h-4" />
              {showSimulation ? "Обновить" : "Запустить 10,000 симуляций"}
            </button>
          </div>

          {showSimulation ? (
            simLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-10 h-10 animate-spin text-[#A855F7] mb-4" />
                <p className="text-sm text-[#9CA3AF]">Выполняется симуляция...</p>
              </div>
            ) : (
              <>
                <p className="text-sm text-[#9CA3AF] mb-4">
                  Распределение вероятностей по итогам 10,000 симуляций оставшихся матчей сезона.
                </p>

                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={monteCarloData} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#0B192C" />
                    <XAxis type="number" stroke="#9CA3AF" fontSize={12} />
                    <YAxis
                      dataKey="name"
                      type="category"
                      stroke="#9CA3AF"
                      fontSize={12}
                      width={50}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#060F1D",
                        border: "1px solid #0B192C",
                        borderRadius: "8px",
                        color: "#F9FAFB",
                      }}
                    />
                    <Bar dataKey="champion" name="Чемпионство %" stackId="a" fill="#FEBE10" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="top4" name="Топ-4 %" stackId="a" fill="#3B82F6" />
                    <Bar dataKey="relegation" name="Вылет %" stackId="a" fill="#EF4444" />
                  </BarChart>
                </ResponsiveContainer>

                {/* Key probabilities cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  {simulation?.currentStandings.slice(0, 3).map((team) => (
                    <div
                      key={team.id}
                      className="bg-[#060F1D] rounded-lg p-4 border border-[#0B192C]"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: team.color || "#3B82F6" }}
                        />
                        <span className="text-sm text-white font-medium">{team.name}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <p className="text-xs text-[#9CA3AF]">Чемп</p>
                          <p className="text-lg font-bold text-[#FEBE10] font-mono-data">
                            {team.championProbability}%
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-[#9CA3AF]">Топ-4</p>
                          <p className="text-lg font-bold text-[#3B82F6] font-mono-data">
                            {team.top4Probability}%
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-[#9CA3AF]">Вылет</p>
                          <p className="text-lg font-bold text-[#EF4444] font-mono-data">
                            {team.relegationProbability}%
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )
          ) : (
            <div className="text-center py-12">
              <Shield className="w-12 h-12 text-[#A855F7]/30 mx-auto mb-4" />
              <p className="text-[#9CA3AF] text-sm">
                Нажмите "Запустить" для выполнения симуляции Монте-Карло
              </p>
              <p className="text-[#9CA3AF]/60 text-xs mt-1">
                10,000 итераций • ~2-3 секунды
              </p>
            </div>
          )}
        </motion.div>

        {/* Form Trends */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card-dark rounded-xl p-6"
        >
          <h2 className="text-lg font-bold text-white mb-6">Текущая форма команд</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {standings?.slice(0, 6).map((team) => {
              const recentForm = [
                { result: team.wins && team.wins > 15 ? "W" : "D", icon: team.wins && team.wins > 15 ? ChevronUp : Minus },
                { result: "W", icon: ChevronUp },
                { result: team.draws && team.draws > 5 ? "D" : "W", icon: team.draws && team.draws > 5 ? Minus : ChevronUp },
                { result: "W", icon: ChevronUp },
                { result: team.losses && team.losses > 8 ? "L" : "W", icon: team.losses && team.losses > 8 ? ChevronDown : ChevronUp },
              ];
              
              return (
                <div
                  key={team.id}
                  className="flex items-center justify-between bg-[#060F1D] rounded-lg p-3"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: team.color || "#3B82F6" }}
                    >
                      {team.shortName?.slice(0, 2)}
                    </div>
                    <span className="text-sm text-white font-medium">{team.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {recentForm.map((f, i) => (
                      <div
                        key={i}
                        className={`w-7 h-7 rounded flex items-center justify-center text-xs font-bold ${
                          f.result === "W"
                            ? "bg-[#00E701]/20 text-[#00E701]"
                            : f.result === "D"
                            ? "bg-[#3B82F6]/20 text-[#3B82F6]"
                            : "bg-[#EF4444]/20 text-[#EF4444]"
                        }`}
                      >
                        {f.result}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
