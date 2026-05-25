import { trpc } from "@/providers/trpc";
import { Loader2 } from "lucide-react";

export default function SportTicker() {
  const { data: matches, isLoading } = trpc.match.recentResults.useQuery();

  const tickerItems = matches?.map((match) => ({
    home: match.homeTeamName,
    away: match.awayTeamName,
    homeGoals: match.homeGoals ?? 0,
    awayGoals: match.awayGoals ?? 0,
  })) || [
    { home: "MCI", away: "LIV", homeGoals: 2, awayGoals: 1 },
    { home: "ARS", away: "MUN", homeGoals: 3, awayGoals: 0 },
    { home: "RMA", away: "BAR", homeGoals: 2, awayGoals: 2 },
    { home: "INT", away: "ACM", homeGoals: 1, awayGoals: 0 },
    { home: "BAY", away: "BVB", homeGoals: 4, awayGoals: 1 },
  ];

  const content = tickerItems.map((match, i) => (
    <span key={i} className="mx-8 text-sm font-mono-data text-[#9CA3AF]">
      <strong className="text-[#F9FAFB]">{match.home}</strong>
      {" "}
      <span className="text-[#00E701]">{match.homeGoals}:{match.awayGoals}</span>
      {" "}
      <strong className="text-[#F9FAFB]">{match.away}</strong>
      {" \u2022 "}
    </span>
  ));

  return (
    <div className="w-full overflow-hidden bg-[#060F1D] border-t border-[#0B192C] py-3">
      {isLoading ? (
        <div className="flex items-center justify-center py-1">
          <Loader2 className="w-4 h-4 animate-spin text-[#00E701]" />
        </div>
      ) : (
        <div className="ticker-wrapper overflow-hidden whitespace-nowrap">
          <div className="ticker-content">
            {content}
            {content}
          </div>
        </div>
      )}
    </div>
  );
}
