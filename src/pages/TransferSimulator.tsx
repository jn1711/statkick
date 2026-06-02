import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  ArrowLeft,
  ArrowRightLeft,
  BarChart3,
  Gauge,
  Loader2,
  Search,
  Shield,
  Shirt,
  Target,
  TrendingUp,
  User,
  Users,
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
import TeamLogo from "@/components/TeamLogo";

const POSITIONS = [
  { value: "ALL", label: "Все", icon: Users },
  { value: "GK", label: "ВР", icon: User },
  { value: "DEF", label: "ЗАЩ", icon: Shield },
  { value: "MID", label: "ПЗ", icon: TrendingUp },
  { value: "FWD", label: "НАП", icon: Target },
] as const;

function numberValue(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function signed(value: unknown) {
  const number = numberValue(value);
  return `${number > 0 ? "+" : ""}${number.toFixed(2)}`;
}

export default function TransferSimulator() {
  const [selectedPlayer, setSelectedPlayer] = useState<number | null>(null);
  const [fromTeam, setFromTeam] = useState<number | null>(null);
  const [toTeam, setToTeam] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [position, setPosition] = useState<(typeof POSITIONS)[number]["value"]>("ALL");
  const [teamFilter, setTeamFilter] = useState<number | "ALL">("ALL");

  const { data: players, isLoading: playersLoading } = trpc.player.list.useQuery({});

  const uniqueTeams = useMemo(
    () =>
      players
        ? [...new Map(players.map(player => [player.teamId, player.team])).entries()]
            .map(([id, team]) => ({ id, ...team }))
            .sort((a, b) => a.name.localeCompare(b.name))
        : [],
    [players]
  );

  const selectedPlayerData = players?.find(player => player.id === selectedPlayer);
  const selectedIsGoalkeeper = selectedPlayerData?.position === "GK";

  const filteredPlayers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return (players ?? []).filter(player => {
      const matchesSearch =
        !query ||
        player.name.toLowerCase().includes(query) ||
        player.team.name.toLowerCase().includes(query);
      const matchesPosition = position === "ALL" || player.position === position;
      const matchesTeam = teamFilter === "ALL" || player.teamId === teamFilter;
      return matchesSearch && matchesPosition && matchesTeam;
    });
  }, [players, position, search, teamFilter]);

  useEffect(() => {
    if (!selectedPlayerData) return;
    setFromTeam(selectedPlayerData.teamId);

    if (!toTeam || toTeam === selectedPlayerData.teamId) {
      const nextTeam = uniqueTeams.find(team => team.id !== selectedPlayerData.teamId);
      setToTeam(nextTeam?.id ?? null);
    }
  }, [selectedPlayerData, toTeam, uniqueTeams]);

  const { data: simulation, isLoading: simLoading } =
    trpc.player.transferSimulate.useQuery(
      {
        playerId: selectedPlayer || 0,
        fromTeamId: fromTeam || 0,
        toTeamId: toTeam || 0,
      },
      { enabled: !!selectedPlayer && !!fromTeam && !!toTeam }
    );

  const comparisonData = simulation
    ? selectedIsGoalkeeper
      ? [
          {
            metric: "xGA прежней",
            before:
              numberValue(simulation.fromTeam.homeXga) +
              numberValue(simulation.fromTeam.awayXga),
            after:
              numberValue(simulation.fromTeam.homeXga) +
              numberValue(simulation.fromTeam.awayXga) -
              numberValue(simulation.impact.fromTeamDefenseChange),
          },
          {
            metric: "xGA новой",
            before:
              numberValue(simulation.toTeam.homeXga) +
              numberValue(simulation.toTeam.awayXga),
            after:
              numberValue(simulation.toTeam.homeXga) +
              numberValue(simulation.toTeam.awayXga) -
              numberValue(simulation.impact.toTeamDefenseChange),
          },
          {
            metric: "Защита прежней",
            before: 100,
            after: Math.max(0, 100 + numberValue(simulation.impact.fromTeamDefenseChange) * 20),
          },
          {
            metric: "Защита новой",
            before: 100,
            after: 100 + numberValue(simulation.impact.toTeamDefenseChange) * 20,
          },
        ]
      : [
        {
          metric: "xG прежней",
          before:
            numberValue(simulation.fromTeam.homeXg) +
            numberValue(simulation.fromTeam.awayXg),
          after: numberValue(simulation.impact.fromTeamNewXg),
        },
        {
          metric: "xG новой",
          before:
            numberValue(simulation.toTeam.homeXg) +
            numberValue(simulation.toTeam.awayXg),
          after: numberValue(simulation.impact.toTeamNewXg),
        },
        {
          metric: "xA прежней",
          before:
            (numberValue(simulation.fromTeam.homeXg) +
              numberValue(simulation.fromTeam.awayXg)) *
            0.55,
          after: numberValue(simulation.impact.fromTeamNewXa),
        },
        {
          metric: "xA новой",
          before:
            (numberValue(simulation.toTeam.homeXg) +
              numberValue(simulation.toTeam.awayXg)) *
            0.55,
          after: numberValue(simulation.impact.toTeamNewXa),
        },
      ]
    : [];

  return (
    <div className="min-h-screen bg-[#030B15]">
      <Header />

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-[#9CA3AF] hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Назад</span>
        </Link>

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
            Сравните влияние игрока на xG, создание моментов, адаптацию и баланс состава.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-6">
          <motion.section
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card-dark rounded-xl p-5"
          >
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-[#00E701]" />
                <h2 className="text-lg font-bold text-white">Игроки</h2>
              </div>
              <span className="text-xs text-[#9CA3AF]">
                {filteredPlayers.length}/{players?.length ?? 0}
              </span>
            </div>

            <div className="space-y-3 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                <input
                  value={search}
                  onChange={event => setSearch(event.target.value)}
                  placeholder="Поиск игрока или клуба"
                  className="w-full bg-[#030B15] border border-[#0B192C] rounded-lg pl-10 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#00E701]/50"
                />
              </div>

              <div className="grid grid-cols-5 gap-2">
                {POSITIONS.map(item => (
                  <button
                    key={item.value}
                    onClick={() => setPosition(item.value)}
                    className={`h-10 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
                      position === item.value
                        ? "bg-[#00E701] text-[#030B15] border-[#00E701]"
                        : "bg-[#060F1D] text-[#9CA3AF] border-[#0B192C] hover:text-white"
                    }`}
                  >
                    <item.icon className="w-3.5 h-3.5" />
                    {item.label}
                  </button>
                ))}
              </div>

              <select
                value={teamFilter}
                onChange={event =>
                  setTeamFilter(event.target.value === "ALL" ? "ALL" : Number(event.target.value))
                }
                className="w-full bg-[#030B15] border border-[#0B192C] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#00E701]/50"
              >
                <option value="ALL">Все команды</option>
                {uniqueTeams.map(team => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>

            {playersLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-7 h-7 animate-spin text-[#00E701]" />
              </div>
            ) : (
              <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
                {filteredPlayers.map(player => (
                  <button
                    key={player.id}
                    onClick={() => setSelectedPlayer(player.id)}
                    className={`w-full grid grid-cols-[40px_1fr_auto] gap-3 p-3 rounded-lg transition-all text-left border ${
                      selectedPlayer === player.id
                        ? "bg-[#00E701]/10 border-[#00E701]/40"
                        : "bg-[#060F1D]/60 hover:bg-white/5 border-[#0B192C]"
                    }`}
                  >
                    <TeamLogo team={player.team} size={40} className="rounded-lg" />
                    <div className="min-w-0">
                      <p className="text-sm text-white font-semibold truncate">
                        {player.name}
                      </p>
                      <p className="text-xs text-[#9CA3AF] truncate">
                        {player.team.name} • {player.positionLabel}
                      </p>
                      <div className="flex gap-3 mt-1 text-[11px] text-[#9CA3AF]">
                        {player.position === "GK" && player.goalkeeperMetrics ? (
                          <>
                            <span>{player.goalkeeperMetrics.saveRate}% SV</span>
                            <span>{player.goalkeeperMetrics.saves} сейвов</span>
                            <span>GP {player.goalkeeperMetrics.goalsPrevented}</span>
                          </>
                        ) : (
                          <>
                            <span>xG {player.xg}</span>
                            <span>xA {player.xa}</span>
                            <span>{player.goals}G/{player.assists}A</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-[#00E701] font-mono-data">
                        {player.rating}
                      </p>
                      <p className="text-[10px] text-[#9CA3AF]">рейтинг</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            <div className="card-dark rounded-xl p-5">
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-4 items-end">
                <div>
                  <p className="text-xs text-[#9CA3AF] mb-2">Игрок</p>
                  <div className="bg-[#060F1D] border border-[#0B192C] rounded-lg p-4 min-h-[86px]">
                    {selectedPlayerData ? (
                      <div className="flex items-center gap-3">
                        <div
                          className="w-11 h-11 rounded-lg flex items-center justify-center text-white"
                          style={{
                            backgroundColor:
                              selectedPlayerData.team.color || "#3B82F6",
                          }}
                        >
                          <Shirt className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-white font-semibold truncate">
                            {selectedPlayerData.name}
                          </p>
                          <p className="text-xs text-[#9CA3AF]">
                            {selectedPlayerData.positionLabel} • рейтинг {selectedPlayerData.rating}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-[#9CA3AF]">Выберите игрока слева</p>
                    )}
                  </div>
                </div>

                <ArrowRightLeft className="hidden lg:block w-6 h-6 text-[#A855F7] mb-8" />

                <div>
                  <p className="text-xs text-[#9CA3AF] mb-2">Команда назначения</p>
                  <select
                    value={toTeam ?? ""}
                    onChange={event => setToTeam(Number(event.target.value))}
                    disabled={!selectedPlayerData}
                    className="w-full bg-[#060F1D] border border-[#0B192C] rounded-lg px-3 py-4 text-sm text-white focus:outline-none focus:border-[#A855F7]/60 disabled:opacity-50"
                  >
                    <option value="">Выберите команду</option>
                    {uniqueTeams
                      .filter(team => team.id !== fromTeam)
                      .map(team => (
                        <option key={team.id} value={team.id}>
                          {team.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            </div>

            {selectedPlayer && toTeam ? (
              <div className="card-dark rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Gauge className="w-5 h-5 text-[#A855F7]" />
                  <h2 className="text-lg font-bold text-white">Результат симуляции</h2>
                </div>

                {simLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-[#A855F7]" />
                  </div>
                ) : simulation ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-center">
                      <div className="bg-[#060F1D] rounded-lg p-4 border border-[#0B192C]">
                        <div className="flex items-center gap-3">
                          <TeamLogo team={simulation.fromTeam} size={48} className="rounded-lg" />
                          <div>
                            <p className="text-xs text-[#9CA3AF]">Уходит из</p>
                            <p className="text-white font-semibold">{simulation.fromTeam.name}</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-center">
                        <ArrowRightLeft className="w-6 h-6 text-[#A855F7] mx-auto" />
                        <p className="text-xs text-[#9CA3AF] mt-1">трансфер</p>
                      </div>
                      <div className="bg-[#060F1D] rounded-lg p-4 border border-[#0B192C]">
                        <div className="flex items-center gap-3">
                          <TeamLogo team={simulation.toTeam} size={48} className="rounded-lg" />
                          <div>
                            <p className="text-xs text-[#9CA3AF]">Переходит в</p>
                            <p className="text-white font-semibold">{simulation.toTeam.name}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-[#060F1D] rounded-lg p-4 border border-[#00E701]/20">
                        <p className="text-xs text-[#9CA3AF] mb-1">
                          {selectedIsGoalkeeper ? "Предотв. угроз" : "Вклад в xG"}
                        </p>
                        <p className="text-2xl font-bold text-[#00E701] font-mono-data">
                          {selectedIsGoalkeeper
                            ? `${simulation.impact.defensiveContribution}%`
                            : `${simulation.impact.xgContribution}%`}
                        </p>
                      </div>
                      <div className="bg-[#060F1D] rounded-lg p-4 border border-[#3B82F6]/20">
                        <p className="text-xs text-[#9CA3AF] mb-1">
                          {selectedIsGoalkeeper ? "Сейвы" : "Вклад в xA"}
                        </p>
                        <p className="text-2xl font-bold text-[#3B82F6] font-mono-data">
                          {selectedIsGoalkeeper
                            ? simulation.player.goalkeeperMetrics?.saves
                            : `${simulation.impact.xaContribution}%`}
                        </p>
                      </div>
                      <div className="bg-[#060F1D] rounded-lg p-4 border border-[#A855F7]/20">
                        <p className="text-xs text-[#9CA3AF] mb-1">Адаптация</p>
                        <p className="text-2xl font-bold text-[#A855F7] font-mono-data">
                          {Number(simulation.impact.adaptationFactor) * 100}%
                        </p>
                      </div>
                      <div className="bg-[#060F1D] rounded-lg p-4 border border-[#F59E0B]/20">
                        <p className="text-xs text-[#9CA3AF] mb-1">Роль в новой</p>
                        <p className="text-2xl font-bold text-[#F59E0B] font-mono-data">
                          {simulation.impact.roleFit}%
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6">
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <BarChart3 className="w-4 h-4 text-[#00E701]" />
                          <p className="text-sm text-[#9CA3AF]">
                            {selectedIsGoalkeeper ? "Влияние на оборону" : "Командные показатели"}
                          </p>
                        </div>
                        <ResponsiveContainer width="100%" height={250}>
                          <BarChart data={comparisonData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#0B192C" />
                            <XAxis dataKey="metric" stroke="#9CA3AF" fontSize={11} />
                            <YAxis stroke="#9CA3AF" fontSize={11} />
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

                      <div className="space-y-3">
                        <div className="bg-[#060F1D] rounded-lg p-4 border border-[#0B192C]">
                          <p className="text-xs text-[#9CA3AF] mb-2">
                            {selectedIsGoalkeeper ? "Прогноз в новой команде" : "Прогноз в новой команде"}
                          </p>
                          <div className="grid grid-cols-2 gap-3 text-center">
                            <div>
                              <p className="text-2xl font-bold text-[#00E701] font-mono-data">
                                {selectedIsGoalkeeper
                                  ? simulation.impact.projectedCleanSheets
                                  : simulation.impact.projectedGoals}
                              </p>
                              <p className="text-xs text-[#9CA3AF]">
                                {selectedIsGoalkeeper ? "сухих" : "голов"}
                              </p>
                            </div>
                            <div>
                              <p className="text-2xl font-bold text-[#3B82F6] font-mono-data">
                                {selectedIsGoalkeeper
                                  ? simulation.impact.projectedGoalsPrevented
                                  : simulation.impact.projectedAssists}
                              </p>
                              <p className="text-xs text-[#9CA3AF]">
                                {selectedIsGoalkeeper ? "предотв. голов" : "ассистов"}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-[#060F1D] rounded-lg p-4 border border-[#0B192C]">
                          <p className="text-xs text-[#9CA3AF] mb-3">Изменения</p>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-[#9CA3AF]">
                                {selectedIsGoalkeeper ? "Защита прежней" : "xG прежней"}
                              </span>
                              <span className="text-[#EF4444] font-mono-data">
                                {signed(simulation.impact.fromTeamXgChange)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#9CA3AF]">
                                {selectedIsGoalkeeper ? "Защита новой" : "xG новой"}
                              </span>
                              <span className="text-[#00E701] font-mono-data">
                                {signed(simulation.impact.toTeamXgChange)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#9CA3AF]">Баланс защиты</span>
                              <span className="text-[#3B82F6] font-mono-data">
                                {signed(simulation.impact.toTeamDefenseChange)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {selectedPlayerData && (
                      <div>
                        <p className="text-sm text-[#9CA3AF] mb-3">Профиль игрока</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {(selectedIsGoalkeeper && selectedPlayerData.goalkeeperMetrics
                            ? [
                                { label: "Сейвы", value: selectedPlayerData.goalkeeperMetrics.saves, max: 130, color: "#00E701" },
                                { label: "SV%", value: selectedPlayerData.goalkeeperMetrics.saveRate, max: 90, color: "#3B82F6" },
                                { label: "Предотв.", value: selectedPlayerData.goalkeeperMetrics.goalsPrevented, max: 12, color: "#A855F7" },
                                { label: "Сухие", value: selectedPlayerData.goalkeeperMetrics.cleanSheets, max: 20, color: "#F59E0B" },
                              ]
                            : [
                                { label: "Голы", value: selectedPlayerData.goals, max: 30, color: "#00E701" },
                                { label: "Передачи", value: selectedPlayerData.assists, max: 24, color: "#3B82F6" },
                                { label: "Минуты", value: selectedPlayerData.minutes, max: 3200, color: "#A855F7" },
                                { label: "Матчи", value: selectedPlayerData.appearances, max: 38, color: "#F59E0B" },
                              ]).map(item => (
                            <div key={item.label} className="bg-[#060F1D] rounded-lg p-3 border border-[#0B192C]">
                              <div className="flex justify-between text-xs mb-2">
                                <span className="text-[#9CA3AF]">{item.label}</span>
                                <span className="text-white font-mono-data">{item.value}</span>
                              </div>
                              <div className="w-full h-2 bg-[#0B192C] rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full"
                                  style={{
                                    width: `${Math.min(100, (numberValue(item.value) / item.max) * 100)}%`,
                                    backgroundColor: item.color,
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="card-dark rounded-xl p-12 text-center">
                <ArrowRightLeft className="w-12 h-12 text-[#A855F7]/40 mx-auto mb-4" />
                <p className="text-[#9CA3AF] text-sm">
                  Выберите игрока и команду назначения, чтобы запустить симуляцию.
                </p>
              </div>
            )}
          </motion.section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
