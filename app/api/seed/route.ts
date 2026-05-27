import { NextResponse } from "next/server";
import { spawn } from "node:child_process";

export async function POST(request: Request): Promise<NextResponse> {
  const secret = request.headers.get("x-seed-secret");
  if (!process.env.SEED_API_KEY || secret !== process.env.SEED_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const child = spawn("npx", ["tsx", "scripts/seed-database.ts"], {
    stdio: "inherit",
    shell: true,
  });

  return NextResponse.json({ started: true, pid: child.pid });
}
