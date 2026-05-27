"use client";

import { useState } from "react";

const TABS = ["Champions League", "Europa League", "World Cup 2026"] as const;

export default function TournamentsPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Champions League");

  return (
    <main className="min-h-screen bg-[#0B0F19] p-6 text-white">
      <div className="mx-auto max-w-6xl rounded-lg bg-[#1F2937] p-6">
        <h1 className="mb-4 text-2xl font-semibold">Tournaments</h1>
        <div className="mb-4 flex gap-2">
          {TABS.map((name) => (
            <button
              key={name}
              onClick={() => setTab(name)}
              className={`rounded px-3 py-2 ${tab === name ? "bg-sky-600" : "bg-slate-700"}`}
            >
              {name}
            </button>
          ))}
        </div>
        {tab === "World Cup 2026" ? (
          <div className="space-y-2">
            <p>Groups A-L, fixtures and group stage simulation are shown here.</p>
            <p>Format: 48 teams, top-2 + 8 best third places -> round of 32.</p>
          </div>
        ) : (
          <p>{tab} calendar and simulation are shown here.</p>
        )}
      </div>
    </main>
  );
}
