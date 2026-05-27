"use client";

import { useState } from "react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

export default function TransferPage() {
  const [playerId, setPlayerId] = useState("");
  const [fromTeamId, setFromTeamId] = useState("");
  const [toTeamId, setToTeamId] = useState("");
  const [result, setResult] = useState<{ newTeamXg: number; newTeamXga: number; impact: string } | null>(null);

  const simulate = async () => {
    const response = await fetch("/api/transfer/simulate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playerId, fromTeamId, toTeamId }),
    });
    setResult(await response.json());
  };

  const graph = result
    ? [
        { name: "xG", value: result.newTeamXg },
        { name: "xGA", value: result.newTeamXga },
      ]
    : [];

  return (
    <main className="min-h-screen bg-[#0B0F19] p-6 text-white">
      <div className="mx-auto max-w-4xl space-y-3 rounded-lg bg-[#1F2937] p-6">
        <h1 className="text-2xl font-semibold">Transfer Simulator</h1>
        <input className="w-full rounded bg-slate-800 p-2" placeholder="Player ID" value={playerId} onChange={(e) => setPlayerId(e.target.value)} />
        <input className="w-full rounded bg-slate-800 p-2" placeholder="From Team ID" value={fromTeamId} onChange={(e) => setFromTeamId(e.target.value)} />
        <input className="w-full rounded bg-slate-800 p-2" placeholder="To Team ID" value={toTeamId} onChange={(e) => setToTeamId(e.target.value)} />
        <button className="rounded bg-emerald-600 px-4 py-2" onClick={simulate}>
          Симулировать трансфер
        </button>
        {result && (
          <>
            <p>Атака команды: {result.newTeamXg.toFixed(2)} xG за матч ({result.impact})</p>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={graph}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Bar dataKey="value" fill="#34D399" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
