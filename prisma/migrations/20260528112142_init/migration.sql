-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT,
    "city" TEXT,
    "country" TEXT NOT NULL,
    "leagueId" TEXT,
    "xGHome" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "xGAHome" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "xGAway" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "xGAAway" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "homeAdvantage" DOUBLE PRECISION NOT NULL DEFAULT 0.35,
    "marketValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "europeanCoeff" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "League" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT,
    "tier" INTEGER NOT NULL DEFAULT 1,
    "season" TEXT NOT NULL,
    "isCup" BOOLEAN NOT NULL DEFAULT false,
    "isInternational" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "League_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Player" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "xG" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "xA" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "xG90" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "xA90" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "minutes" INTEGER NOT NULL DEFAULT 0,
    "games" INTEGER NOT NULL DEFAULT 0,
    "marketValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "age" INTEGER NOT NULL DEFAULT 25,
    "fitness" DOUBLE PRECISION NOT NULL DEFAULT 1.0,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Match" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "leagueId" TEXT NOT NULL,
    "homeTeamId" TEXT NOT NULL,
    "awayTeamId" TEXT NOT NULL,
    "homeGoals" INTEGER,
    "awayGoals" INTEGER,
    "homeXg" DOUBLE PRECISION,
    "awayXg" DOUBLE PRECISION,
    "result" TEXT,
    "season" TEXT NOT NULL,
    "matchday" INTEGER NOT NULL DEFAULT 1,
    "isPlayed" BOOLEAN NOT NULL DEFAULT false,
    "isSimulated" BOOLEAN NOT NULL DEFAULT false,
    "fatigueHome" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "fatigueAway" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tacticalHome" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tacticalAway" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transfer" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "fromTeamId" TEXT NOT NULL,
    "toTeamId" TEXT NOT NULL,
    "season" TEXT NOT NULL,
    "fee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isLoan" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transfer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeasonSimulation" (
    "id" TEXT NOT NULL,
    "leagueId" TEXT NOT NULL,
    "season" TEXT NOT NULL,
    "iterations" INTEGER NOT NULL DEFAULT 10000,
    "results" JSONB NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SeasonSimulation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Team_name_key" ON "Team"("name");

-- CreateIndex
CREATE INDEX "Team_leagueId_idx" ON "Team"("leagueId");

-- CreateIndex
CREATE INDEX "Team_name_idx" ON "Team"("name");

-- CreateIndex
CREATE UNIQUE INDEX "League_name_key" ON "League"("name");

-- CreateIndex
CREATE INDEX "League_season_idx" ON "League"("season");

-- CreateIndex
CREATE INDEX "League_isInternational_idx" ON "League"("isInternational");

-- CreateIndex
CREATE INDEX "Player_teamId_idx" ON "Player"("teamId");

-- CreateIndex
CREATE INDEX "Player_name_idx" ON "Player"("name");

-- CreateIndex
CREATE INDEX "Match_leagueId_season_matchday_idx" ON "Match"("leagueId", "season", "matchday");

-- CreateIndex
CREATE INDEX "Match_homeTeamId_idx" ON "Match"("homeTeamId");

-- CreateIndex
CREATE INDEX "Match_awayTeamId_idx" ON "Match"("awayTeamId");

-- CreateIndex
CREATE INDEX "Match_date_idx" ON "Match"("date");

-- CreateIndex
CREATE INDEX "Transfer_playerId_season_idx" ON "Transfer"("playerId", "season");

-- CreateIndex
CREATE INDEX "SeasonSimulation_leagueId_season_idx" ON "SeasonSimulation"("leagueId", "season");

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "League"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "League"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_homeTeamId_fkey" FOREIGN KEY ("homeTeamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_awayTeamId_fkey" FOREIGN KEY ("awayTeamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transfer" ADD CONSTRAINT "Transfer_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
