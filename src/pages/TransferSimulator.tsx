import { useState } from "react";
import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  ArrowLeft,
  ArrowRightLeft,
  Loader2,
  User,
  Target,
  TrendingUp,
  Shirt,
  ChevronRight,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { motion } from "framer-motion";

// Chart colors

export default function TransferSimulator() {
  const [selectedPlayer, setSelectedPlayer] = useState<number | null>(null);
  const [fromTeam, setFromTeam] = useState<number | null>(null);
  const [toTeam, setToTeam] = useState<number | null>(null);

  const { data: players, isLoading: playersLoading } = trpc.player.list.useQuery({});
  
  const { data: simulation, isLoading: simLoading } = trpc.player.transferSimulate.useQuery(
    {
      playerId: selectedPlayer || 0,
      fromTeamId: fromTeam || 0,
      toTeamId: toTeam || 0,
    },
    { enabled: !!selectedPlayer && !!fromTeam && !!toTeam }
  );

  const uniqueTeams = players
    ? [...new Map(players.map((p) => [p.teamId, p.team])).entries()].map(([id, team]) => ({ id, ...team }))
    : [];

  const selectedPlayerData = players?.find((p) => p.id === selectedPlayer);

  // Comparison data
  const comparisonData = simulation
    ? [
        {
          metric: "xG общий",
          before: parseFloat(String(simulation.fromTeam.homeXg)) + parseFloat(String(simulation.fromTeam.awayXg)),
          after: parseFloat(simulation.impact.fromTeamNewXg),
        },
        {
          metric: "xG новой",
          before: parseFloat(String(simulation.toTeam.homeXg)) + parseFloat(String(simulation.toTeam.awayXg)),
          after: parseFloat(simulation.impact.toTeamNewXg),
        },
      ]
    : [];

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
          <div className="flex items-center gap-3 mb-2">
            <ArrowRightLeft className="w-6 h-6 text-[#A855F7]" />
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Виртуальный трансферный симулятор
            </h1>
          </div>
          <p className="text-[#9CA3AF] text-sm">
            Оцените влияние трансфера игрока на командный потенциал
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Player Selection */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card-dark rounded-xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <User className="w-5 h-5 text-[#00E701]" />
              <h2 className="text-lg font-bold text-white">Выбор игрока</h2>
            </div>

            {playersLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-[#00E701]" />
              </div>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {players?.map((player) => (
                  <button
                    key={player.id}
                    onClick={() => {
                      setSelectedPlayer(player.id);
                      setFromTeam(player.teamId);
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left ${
                      selectedPlayer === player.id
                        ? "bg-[#00E701]/10 border border-[#00E701]/30"
                        : "hover:bg-white/5 border border-transparent"
                    }`}
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0"
                      style={{ backgroundColor: player.team.color || "#3B82F6" }}
                    >
                      {player.position === "FWD" && <Target className="w-4 h-4" />}
                      {player.position === "MID" && <TrendingUp className="w-4 h-4" />}
                      {player.position === "DEF" && <Shirt className="w-4 h-4" />}
                      {player.position === "GK" && <User className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium truncate">{player.name}</p>
                      <p className="text-xs text-[#9CA3AF]">
                        {player.team.name} • {player.position} • xG: {player.xg}
                      </p>
                    </div>
                    {selectedPlayer === player.id && (
                      <ChevronRight className="w-4 h-4 text-[#00E701] shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Team Selection & Simulation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Target Team Selection */}
            <div className="card-dark rounded-xl p-6">
              <h2 className="text-lg font-bold text-white mb-4">Команда назначения</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {uniqueTeams.map((team) => (
                  <button
                    key={team.id}
                    onClick={() => setToTeam(team.id)}
                    disabled={team.id === fromTeam}
                    className={`p-3 rounded-lg border transition-all text-center ${
                      toTeam === team.id
                        ? "border-[#A855F7] bg-[#A855F7]/10"
                        : team.id === fromTeam
                        ? "border-[#0B192C] opacity-30 cursor-not-allowed"
                        : "border-[#0B192C] hover:border-[#9CA3AF]/30 hover:bg-white/5"
                    }`}
                  >
                    <div
                      className="w-8 h-8 rounded-full mx-auto mb-2"
                      style={{ backgroundColor: team.color || "#3B82F6" }}
                    />
                    <p className="text-xs text-white font-medium truncate">{team.name}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Simulation Result */}
            {selectedPlayer && toTeam && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="card-dark rounded-xl p-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <ArrowRightLeft className="w-5 h-5 text-[#A855F7]" />
                  <h2 className="text-lg font-bold text-white">Результат симуляции</h2>
                </div>

                {simLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-[#A855F7]" />
                  </div>
                ) : simulation ? (
                  <div className="space-y-6">
                    {/* Transfer summary */}
                    <div className="flex items-center justify-center gap-4">
                      <div className="text-center">
                        <div
                          className="w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold mx-auto mb-2"
                          style={{ backgroundColor: simulation.fromTeam.color || "#3B82F6" }}
                        >
                          {simulation.fromTeam.shortName?.[0] || "?"}
                        </div>
                        <p className="text-sm text-white font-medium">
                          {simulation.fromTeam.name}
                        </p>
                      </div>
                      <div className="flex flex-col items-center">
                        <ArrowRightLeft className="w-6 h-6 text-[#A855F7]" />
                        <span className="text-xs text-[#A855F7] font-medium mt-1">
                          {simulation.player.name}
                        </span>
                      </div>
                      <div className="text-center">
                        <div
                          className="w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold mx-auto mb-2"
                          style={{ backgroundColor: simulation.toTeam.color || "#EF4444" }}
                        >
                          {simulation.toTeam.shortName?.[0] || "?"}
                        </div>
                        <p className="text-sm text-white font-medium">
                          {simulation.toTeam.name}
                        </p>
                      </div>
                    </div>

                    {/* Impact stats */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-[#060F1D] rounded-lg p-4 text-center border border-[#EF4444]/20">
                        <p className="text-xs text-[#9CA3AF] mb-1">Вклад в xG</p>
                        <p className="text-2xl font-bold text-[#00E701] font-mono-data">
                          {simulation.impact.xgContribution}%
                        </p>
                        <p className="text-xs text-[#9CA3AF] mt-1">
                          от общего xG команды
                        </p>
                      </div>
                      <div className="bg-[#060F1D] rounded-lg p-4 text-center border border-[#00E701]/20">
                        <p className="text-xs text-[#9CA3AF] mb-1">Коэфф. адаптации</p>
                        <p className="text-2xl font-bold text-[#3B82F6] font-mono-data">
                          {simulation.impact.adaptationFactor}
                        </p>
                        <p className="text-xs text-[#9CA3AF] mt-1">
                          скорость интеграции
                        </p>
                      </div>
                    </div>

                    {/* Comparison chart */}
                    <div>
                      <p className="text-sm text-[#9CA3AF] mb-3">Изменение xG после трансфера</p>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={comparisonData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#0B192C" />
                          <XAxis dataKey="metric" stroke="#9CA3AF" fontSize={12} />
                          <YAxis stroke="#9CA3AF" fontSize={12} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#060F1D",
                              border: "1px solid #0B192C",
                              borderRadius: "8px",
                              color: "#F9FAFB",
                            }}
                          />
                          <Bar dataKey="before" name="До" fill="#9CA3AF" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="after" name="После" fill="#00E701" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Player skills */}
                    {selectedPlayerData && (
                      <div>
                        <p className="text-sm text-[#9CA3AF] mb-3">Индивидуальные показатели</p>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-[#9CA3AF] mb-1">Голы: {selectedPlayerData.goals}</p>
                            <div className="w-full h-2 bg-[#0B192C] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#00E701] rounded-full"
                                style={{ width: `${Math.min(100, (selectedPlayerData.goals || 0) * 4)}%` }}
                              />
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-[#9CA3AF] mb-1">Передачи: {selectedPlayerData.assists}</p>
                            <div className="w-full h-2 bg-[#0B192C] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#3B82F6] rounded-full"
                                style={{ width: `${Math.min(100, (selectedPlayerData.assists || 0) * 5)}%` }}
                              />
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-[#9CA3AF] mb-1">Минуты: {selectedPlayerData.minutes}</p>
                            <div className="w-full h-2 bg-[#0B192C] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#A855F7] rounded-full"
                                style={{ width: `${Math.min(100, ((selectedPlayerData.minutes || 0) / 2700) * 100)}%` }}
                              />
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-[#9CA3AF] mb-1">Матчи: {selectedPlayerData.appearances}</p>
                            <div className="w-full h-2 bg-[#0B192C] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#F59E0B] rounded-full"
                                style={{ width: `${Math.min(100, ((selectedPlayerData.appearances || 0) / 30) * 100)}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : null}
              </motion.div>
            )}
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
