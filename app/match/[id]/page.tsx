"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function MatchPage() {
  const { id } = useParams<{ id: string }>();
  const [tacticalHome, setTacticalHome] = useState(0);
  const [tacticalAway, setTacticalAway] = useState(0);

  const { data } = useSWR(
    id ? `/api/match/${id}/predict?tacticalHome=${tacticalHome}&tacticalAway=${tacticalAway}` : null,
    fetcher,
    { refreshInterval: 0 },
  );

  if (!data) return <div className="flex min-h-screen items-center justify-center bg-[#0B0F19] text-white">Loading...</div>;

  return (
    <main className="min-h-screen bg-[#0B0F19] p-6 text-white">
      <h1 className="mb-6 text-2xl font-bold">Match Analysis</h1>

      <div className="mb-8 grid grid-cols-3 gap-4">
        <div className="rounded-lg bg-[#1F2937] p-4 text-center">
          <div className="text-3xl font-bold text-[#10B981]">{(data.pHome * 100).toFixed(1)}%</div>
          <div className="text-[#9CA3AF]">Home Win</div>
        </div>
        <div className="rounded-lg bg-[#1F2937] p-4 text-center">
          <div className="text-3xl font-bold text-[#3B82F6]">{(data.pDraw * 100).toFixed(1)}%</div>
          <div className="text-[#9CA3AF]">Draw</div>
        </div>
        <div className="rounded-lg bg-[#1F2937] p-4 text-center">
          <div className="text-3xl font-bold text-[#EF4444]">{(data.pAway * 100).toFixed(1)}%</div>
          <div className="text-[#9CA3AF]">Away Win</div>
        </div>
      </div>

      <div className="mb-6 rounded-lg bg-[#1F2937] p-4">
        <div className="text-lg">
          Most Likely Score: <span className="text-2xl font-bold text-[#10B981]">{data.mostLikelyScore}</span>
        </div>
        <div className="mt-1 text-[#9CA3AF]">
          Expected: {data.expectedHome.toFixed(2)} - {data.expectedAway.toFixed(2)}
        </div>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-6">
        <div className="rounded-lg bg-[#1F2937] p-4">
          <label className="mb-2 block text-sm text-[#9CA3AF]">Home Team Tactics</label>
          <input
            type="range"
            min={-5}
            max={5}
            step={1}
            value={tacticalHome}
            onChange={(e) => setTacticalHome(Number(e.target.value))}
            className="w-full accent-[#10B981]"
          />
          <div className="mt-1 flex justify-between text-xs text-[#9CA3AF]">
            <span>Defensive</span>
            <span className="font-bold text-[#10B981]">{tacticalHome > 0 ? "+" : ""}{tacticalHome}</span>
            <span>Attacking</span>
          </div>
        </div>

        <div className="rounded-lg bg-[#1F2937] p-4">
          <label className="mb-2 block text-sm text-[#9CA3AF]">Away Team Tactics</label>
          <input
            type="range"
            min={-5}
            max={5}
            step={1}
            value={tacticalAway}
            onChange={(e) => setTacticalAway(Number(e.target.value))}
            className="w-full accent-[#EF4444]"
          />
          <div className="mt-1 flex justify-between text-xs text-[#9CA3AF]">
            <span>Defensive</span>
            <span className="font-bold text-[#EF4444]">{tacticalAway > 0 ? "+" : ""}{tacticalAway}</span>
            <span>Attacking</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg bg-[#1F2937] p-4">
          <div className="text-sm text-[#9CA3AF]">Home Fatigue Index</div>
          <div className="mt-2 h-2 w-full rounded-full bg-[#374151]">
            <div className="h-2 rounded-full bg-[#10B981] transition-all" style={{ width: `${(data.fatigueHome / 0.3) * 100}%` }} />
          </div>
          <div className="mt-1 text-right text-xs text-[#9CA3AF]">{(data.fatigueHome * 100).toFixed(0)}%</div>
        </div>
        <div className="rounded-lg bg-[#1F2937] p-4">
          <div className="text-sm text-[#9CA3AF]">Away Fatigue Index</div>
          <div className="mt-2 h-2 w-full rounded-full bg-[#374151]">
            <div className="h-2 rounded-full bg-[#EF4444] transition-all" style={{ width: `${(data.fatigueAway / 0.3) * 100}%` }} />
          </div>
          <div className="mt-1 text-right text-xs text-[#9CA3AF]">{(data.fatigueAway * 100).toFixed(0)}%</div>
        </div>
      </div>

      <div className="mt-4 text-xs text-[#9CA3AF]">Data source: {data.dataSource}</div>
    </main>
  );
}
