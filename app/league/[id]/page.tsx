"use client";

import { useState } from "react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

export default function LeaguePage({ params }: { params: { id: string } }) {
  const [rows, setRows] = useState<Array<Record<string, number | string>>>([]);
  const [progress, setProgress] = useState(0);

  const runSimulation = async (season: string) => {
    setProgress(0);
    for (let chunk = 1; chunk <= 10; chunk += 1) {
      setProgress(chunk * 10);
      await new Promise((r) => setTimeout(r, 40));
    }
    const response = await fetch(`/api/league/${params.id}/simulate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ season }),
    });
    const payload = (await response.json()) as { results: Array<Record<string, number | string>> };
    setRows(payload.results ?? []);
  };

  return (
    <main className="min-h-screen bg-[#0B0F19] p-6 text-white">
      <div className="mx-auto max-w-6xl space-y-4 rounded-lg bg-[#1F2937] p-6">
        <h1 className="text-2xl font-semibold">League Simulation</h1>
        <div className="flex gap-3">
          <button className="rounded bg-sky-600 px-4 py-2" onClick={() => runSimulation("2025-26")}>
            Симулировать сезон 2025-26
          </button>
          <button className="rounded bg-indigo-600 px-4 py-2" onClick={() => runSimulation("2026-27")}>
            Симулировать 2 сезона вперед
          </button>
        </div>
        <div className="h-2 overflow-hidden rounded bg-slate-800">
          <div className="h-full bg-emerald-500 transition-all" style={{ width: `${progress}%` }} />
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows}>
              <XAxis dataKey="teamId" />
              <YAxis />
              <Bar dataKey="pos1" fill="#22D3EE" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </main>
  );
}
