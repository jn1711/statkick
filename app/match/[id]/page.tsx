"use client";

import { useEffect, useMemo, useState } from "react";
import { Pie, PieChart, Cell, ResponsiveContainer } from "recharts";

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
  const [tactic, setTactic] = useState(0);

  useEffect(() => {
    fetch(`/api/match/${params.id}/predict`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData(null));
  }, [params.id]);

  const chartData = useMemo(
    () =>
      data
        ? [
            { name: "P1", value: data.pHome },
            { name: "X", value: data.pDraw },
            { name: "P2", value: data.pAway },
          ]
        : [],
    [data],
  );

  return (
    <main className="min-h-screen bg-[#0B0F19] p-6 text-white">
      <div className="mx-auto max-w-5xl rounded-lg bg-[#1F2937] p-6">
        <h1 className="mb-4 text-2xl font-semibold">Match Prediction</h1>
        {data && (
          <>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData} dataKey="value" nameKey="name" outerRadius={90}>
                    {chartData.map((_, index) => (
                      <Cell key={index} fill={["#60A5FA", "#A78BFA", "#F87171"][index]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <p className="mb-3">Вероятный счет: {data.mostLikelyScore}</p>
            <p className="mb-3">
              Fatigue: home {(data.fatigueHome * 100).toFixed(1)}% / away {(data.fatigueAway * 100).toFixed(1)}%
            </p>
            <label className="block text-sm">Тактика ({tactic})</label>
            <input
              type="range"
              min={-5}
              max={5}
              value={tactic}
              onChange={(e) => setTactic(Number(e.target.value))}
              className="w-full"
            />
          </>
        )}
      </div>
    </main>
  );
}
