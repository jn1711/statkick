"use client";

import { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { ArrowLeft, Trophy, Globe, Shield, Star } from "lucide-react";
import { motion } from "framer-motion";

const TABS = [
  { name: "Champions League", icon: Star, color: "#FEBE10" },
  { name: "Europa League", icon: Shield, color: "#F97316" },
  { name: "World Cup 2026", icon: Globe, color: "#00E701" },
] as const;

type TabName = (typeof TABS)[number]["name"];

const CL_GROUPS = [
  { name: "Группа A", teams: ["Real Madrid", "Bayern Munich", "Inter Milan", "PSG"] },
  { name: "Группа B", teams: ["Man City", "Barcelona", "Dortmund", "AC Milan"] },
  { name: "Группа C", teams: ["Liverpool", "Atletico Madrid", "Ajax", "Napoli"] },
  { name: "Группа D", teams: ["Arsenal", "Juventus", "Porto", "Benfica"] },
];

const WC_GROUPS = [
  { name: "Группа A", teams: ["USA", "Germany", "Japan", "Nigeria"] },
  { name: "Группа B", teams: ["Brazil", "France", "South Korea", "Canada"] },
  { name: "Группа C", teams: ["Argentina", "England", "Mexico", "Australia"] },
  { name: "Группа D", teams: ["Spain", "Netherlands", "Saudi Arabia", "Qatar"] },
];

export default function TournamentsPage() {
  const [tab, setTab] = useState<TabName>("Champions League");

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
          <span className="text-sm">Назад</span>
        </a>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="w-6 h-6 text-[#00E701]" />
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Турниры</h1>
          </div>
          <p className="text-[#9CA3AF] text-sm">
            Группы, расписание и симуляция международных турниров
          </p>
        </motion.div>

        {/* Tab Buttons */}
        <div className="mb-8 flex gap-2 flex-wrap">
          {TABS.map((t) => (
            <button
              key={t.name}
              onClick={() => setTab(t.name)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                tab === t.name
                  ? "text-[#030B15]"
                  : "text-[#9CA3AF] bg-[#060F1D] border border-[#0B192C] hover:text-white"
              }`}
              style={tab === t.name ? { backgroundColor: t.color } : {}}
            >
              <t.icon className="w-4 h-4" />
              {t.name}
            </button>
          ))}
        </div>

        {/* Content */}
        {tab === "World Cup 2026" ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="card-dark rounded-xl p-6 gradient-border-green">
              <h2 className="text-lg font-bold text-white mb-4">FIFA World Cup 2026</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-[#9CA3AF]">
                <div className="bg-[#060F1D] rounded-lg p-4 border border-[#0B192C]">
                  <p className="text-[#00E701] font-medium mb-1">Формат</p>
                  <p>48 команд &bull; 12 групп по 4 команды</p>
                </div>
                <div className="bg-[#060F1D] rounded-lg p-4 border border-[#0B192C]">
                  <p className="text-[#00E701] font-medium mb-1">Плей-офф</p>
                  <p>Топ-2 + 8 лучших третьих &rarr; 1/16 финала</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {WC_GROUPS.map((group) => (
                <motion.div
                  key={group.name}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="card-dark rounded-xl p-5"
                >
                  <h3 className="text-sm font-bold text-[#00E701] mb-3">{group.name}</h3>
                  <div className="space-y-2">
                    {group.teams.map((team, i) => (
                      <div
                        key={team}
                        className="flex items-center gap-3 py-1.5 border-b border-[#0B192C] last:border-0"
                      >
                        <span className="text-xs text-[#9CA3AF] w-4">{i + 1}</span>
                        <Globe className="w-4 h-4 text-[#3B82F6]" />
                        <span className="text-sm text-white">{team}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="card-dark rounded-xl p-6">
              <h2 className="text-lg font-bold text-white mb-2">{tab}</h2>
              <p className="text-sm text-[#9CA3AF] mb-6">
                Групповой этап и турнирная сетка
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {CL_GROUPS.map((group) => (
                <motion.div
                  key={group.name}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="card-dark rounded-xl p-5"
                >
                  <h3
                    className="text-sm font-bold mb-3"
                    style={{
                      color: tab === "Europa League" ? "#F97316" : "#FEBE10",
                    }}
                  >
                    {group.name}
                  </h3>
                  <div className="space-y-2">
                    {group.teams.map((team, i) => (
                      <div
                        key={team}
                        className="flex items-center gap-3 py-1.5 border-b border-[#0B192C] last:border-0"
                      >
                        <span className="text-xs text-[#9CA3AF] w-4">{i + 1}</span>
                        <Shield className="w-4 h-4 text-[#3B82F6]" />
                        <span className="text-sm text-white">{team}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </main>

      <Footer />
    </div>
  );
}
