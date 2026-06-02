import { useState } from "react";

type Team = {
  id?: number;
  name?: string;
  shortName?: string | null;
  logoUrl?: string | null;
  color?: string | null;
};

export default function TeamLogo({
  team,
  size = 40,
  className = "",
}: {
  team: Team;
  size?: number;
  className?: string;
}) {
  const [errored, setErrored] = useState(false);

  const slug = (team?.shortName || team?.name || "team")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const localSrc = `/team-logos/${slug}.png`;

  const src = !errored && (team?.logoUrl || localSrc);

  if (src) {
    return (
      // eslint-disable-next-line jsx-a11y/alt-text
      <img
        src={src}
        onError={() => setErrored(true)}
        className={`object-contain rounded ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  // fallback: colored initial
  const initial = team?.shortName?.[0] || team?.name?.[0] || "T";

  return (
    <div
      className={`rounded-xl flex items-center justify-center text-white font-bold text-lg ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: team?.color || "#3B82F6",
      }}
    >
      {initial}
    </div>
  );
}
