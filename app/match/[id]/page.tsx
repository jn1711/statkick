"use client";

import { useEffect, useMemo, useState } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
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

interface PredictResponse {
  pHome: number;
  pDraw: number;
  pAway: number;
  mostLikelyScore: string;
  fatigueHome: number;
  fatigueAway: number;
  expectedHome: number;
  expectedAway: number;
}

export default function MatchPage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<PredictResponse | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [tacticalFocus, setTacticalFocus] = useState(50);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    fetch(`/api/match/${params.id}/predict`, { signal: controller.signal })
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) {
          setData(d);
          setLoaded(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setData(null);
          setLoaded(true);
        }
      });
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [params.id]);

  const loading = !loaded;

  const predictionData = useMemo(
    () =>
      data
        ? [
            { name: "П1 (Хоз.)", value: data.pHome, color: "#00E701" },
            { name: "X (Ничья)", value: data.pDraw, color: "#3B82F6" },
            { name: "П2 (Гости)", value: data.pAway, color: "#EF4444" },
          ]
        : [
            { name: "П1 (Хоз.)", value: 45, color: "#00E701" },
            { name: "X (Ничья)", value: 25, color: "#3B82F6" },
            { name: "П2 (Гости)", value: 30, color: "#EF4444" },
          ],
    [data],
  );

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

  const homeXg = data ? data.expectedHome.toFixed(2) : "1.80";
  const awayXg = data ? data.expectedAway.toFixed(2) : "1.20";

  const adjustedXg = {
    home: (parseFloat(homeXg) * (1 + (tacticalFocus - 50) / 200)).toFixed(2),
    away: (parseFloat(awayXg) * (1 - (tacticalFocus - 50) / 300)).toFixed(2),
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030B15] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#00E701]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030B15]">
      <Header />

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {/* Back button */}
        <a
          href="/"
          className="inline-flex items-center gap-2 text-[#9CA3AF] hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Назад к матчам</span>
        </a>

        {/* Match Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-dark rounded-2xl p-6 sm:p-10 mb-8"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="w-14 h-14 rounded-xl bg-[#00E701]/20 flex items-center justify-center text-[#00E701] font-bold text-xl">
                H
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-white">Хозяева</p>
                <p className="text-sm text-[#9CA3AF]">Домашняя команда</p>
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-[#3B82F6] mb-1">vs</div>
              <p className="text-xs text-[#9CA3AF]">Матч #{params.id}</p>
              <span className="inline-block mt-2 text-xs px-3 py-1 rounded-full font-medium text-[#3B82F6] bg-[#3B82F6]/10">
                Предстоит
              </span>
            </div>

            <div className="flex items-center gap-4 text-center sm:text-right">
              <div className="sm:text-right">
                <p className="text-xl sm:text-2xl font-bold text-white">Гости</p>
                <p className="text-sm text-[#9CA3AF]">Выездная команда</p>
              </div>
              <div className="w-14 h-14 rounded-xl bg-[#3B82F6]/20 flex items-center justify-center text-[#3B82F6] font-bold text-xl">
                A
              </div>
            </div>
          </div>
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

            <div className="text-center py-8 text-[#9CA3AF] text-sm">
              Нет исторических встреч
            </div>

            {/* Form Charts */}
            <h3 className="text-sm font-semibold text-[#9CA3AF] mb-3">Форма (последние 5 матчей)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-[#00E701] mb-2">Хозяева — xG</p>
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
                <p className="text-xs text-[#3B82F6] mb-2">Гости — xG</p>
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
            {data?.mostLikelyScore && (
              <div className="bg-[#060F1D] rounded-xl p-4 border border-[#00E701]/20 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-[#00E701]" />
                  <span className="text-sm text-[#9CA3AF]">Наиболее вероятный счёт</span>
                </div>
                <p className="text-3xl font-bold text-[#00E701] font-mono-data text-center">
                  {data.mostLikelyScore}
                </p>
              </div>
            )}

            {/* Expected xG */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-xs text-[#9CA3AF] mb-1">Хозяева xG</p>
                <p className="text-2xl font-bold text-[#00E701] font-mono-data">{homeXg}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-[#9CA3AF] mb-1">Гости xG</p>
                <p className="text-2xl font-bold text-[#3B82F6] font-mono-data">{awayXg}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Fatigue Index */}
        {data && (
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
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-white font-medium">Хозяева</span>
                  <span className="text-sm font-bold font-mono-data text-[#00E701]">
                    {(data.fatigueHome * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="w-full h-3 bg-[#0B192C] rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full rounded-full bg-[#00E701] transition-all"
                    style={{ width: `${data.fatigueHome * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-white font-medium">Гости</span>
                  <span className="text-sm font-bold font-mono-data text-[#F59E0B]">
                    {(data.fatigueAway * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="w-full h-3 bg-[#0B192C] rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full rounded-full bg-[#F59E0B] transition-all"
                    style={{ width: `${data.fatigueAway * 100}%` }}
                  />
                </div>
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
                    +{(((Number(adjustedXg.home) / Number(homeXg)) - 1) * 100).toFixed(1)}%
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
                    {(((Number(adjustedXg.away) / Number(awayXg)) - 1) * 100).toFixed(1)}%
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
