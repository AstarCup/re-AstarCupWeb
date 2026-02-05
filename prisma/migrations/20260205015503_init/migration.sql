-- CreateEnum
CREATE TYPE "BeatmapSelectMod" AS ENUM ('NM', 'HD', 'HR', 'DT', 'LZ', 'TB');

-- CreateEnum
CREATE TYPE "MultiplayerRoomType" AS ENUM ('SOLO', 'TEAM_VS');

-- CreateEnum
CREATE TYPE "TeamColor" AS ENUM ('blue_team', 'red_team');

-- CreateEnum
CREATE TYPE "TeamState" AS ENUM ('ACTIVE', 'UNAPPROVED', 'APPROVED', 'BANNED');

-- CreateEnum
CREATE TYPE "UserState" AS ENUM ('ACTIVE', 'REGISTERED', 'ABANDONED', 'BANNED');

-- CreateEnum
CREATE TYPE "UserGroupType" AS ENUM ('HOST', 'ADMIN', 'POOLER', 'STREAMER', 'TESTER', 'GFX', 'SHEETER', 'COMMENTATOR', 'MAPPER', 'REFEREE', 'PLAYER');

-- CreateEnum
CREATE TYPE "Season" AS ENUM ('S1', 'S2');

-- CreateEnum
CREATE TYPE "Category" AS ENUM ('QUA', 'RO16', 'QF', 'SF', 'F', 'GF');

-- CreateTable
CREATE TABLE "Beatmap" (
    "id" SERIAL NOT NULL,
    "beatmap_id" INTEGER NOT NULL,
    "beatmapset_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "title_unicode" TEXT NOT NULL,
    "artist" TEXT NOT NULL,
    "artist_unicode" TEXT NOT NULL,
    "creator" TEXT NOT NULL,
    "cover_url" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "ar" DOUBLE PRECISION NOT NULL,
    "od" DOUBLE PRECISION NOT NULL,
    "cs" DOUBLE PRECISION NOT NULL,
    "hp" DOUBLE PRECISION NOT NULL,
    "bpm" DOUBLE PRECISION NOT NULL,
    "length" INTEGER NOT NULL,
    "max_combo" INTEGER NOT NULL,
    "star_rating" DOUBLE PRECISION NOT NULL,
    "mod" JSONB NOT NULL DEFAULT '[]',
    "selectMod" "BeatmapSelectMod" NOT NULL DEFAULT 'NM',
    "selectModSlot" INTEGER NOT NULL DEFAULT 1,
    "selectByosuId" INTEGER NOT NULL,
    "selectNote" TEXT NOT NULL DEFAULT '',
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "needTest" BOOLEAN NOT NULL DEFAULT false,
    "isCustom" BOOLEAN NOT NULL DEFAULT false,
    "isOriginal" BOOLEAN NOT NULL DEFAULT false,
    "season" INTEGER NOT NULL DEFAULT 1,
    "category" "Category" NOT NULL DEFAULT 'QUA',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Beatmap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BeatmapComment" (
    "id" SERIAL NOT NULL,
    "beatmap_id" INTEGER NOT NULL,
    "comment" TEXT NOT NULL DEFAULT '',
    "osuid" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BeatmapComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "sender_id" INTEGER NOT NULL,
    "receiver_id" INTEGER NOT NULL,
    "room_id" INTEGER,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "isSystemMessage" BOOLEAN NOT NULL DEFAULT false,
    "isAccepted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MultiplayerRoom" (
    "room_id" SERIAL NOT NULL,
    "type" "MultiplayerRoomType" NOT NULL DEFAULT 'SOLO',
    "season" "Season" NOT NULL DEFAULT 'S1',
    "category" "Category" NOT NULL DEFAULT 'QUA',
    "multiplayerSoloRoomRoom_id" INTEGER,
    "multiplayerTeamvsRoomRoom_id" INTEGER,
    "score_red" INTEGER NOT NULL DEFAULT 0,
    "score_blue" INTEGER NOT NULL DEFAULT 0,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MultiplayerRoom_pkey" PRIMARY KEY ("room_id")
);

-- CreateTable
CREATE TABLE "MultiplayerSoloRoom" (
    "room_id" SERIAL NOT NULL,
    "player_red_id" INTEGER NOT NULL,
    "player_blue_id" INTEGER NOT NULL,

    CONSTRAINT "MultiplayerSoloRoom_pkey" PRIMARY KEY ("room_id")
);

-- CreateTable
CREATE TABLE "MultiplayerTeamvsRoom" (
    "room_id" SERIAL NOT NULL,
    "team_red_id" INTEGER NOT NULL,
    "team_blue_id" INTEGER NOT NULL,

    CONSTRAINT "MultiplayerTeamvsRoom_pkey" PRIMARY KEY ("room_id")
);

-- CreateTable
CREATE TABLE "Score" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "username" TEXT NOT NULL,
    "beatmap_id" INTEGER NOT NULL,
    "total_score" INTEGER NOT NULL DEFAULT 0,
    "accuracy" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "max_combo" INTEGER NOT NULL DEFAULT 0,
    "mods" JSONB NOT NULL DEFAULT '[]',
    "rank" INTEGER NOT NULL DEFAULT 0,
    "pp" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "passed" BOOLEAN NOT NULL DEFAULT true,
    "statistics" JSONB NOT NULL DEFAULT '[]',
    "ended_at" TIMESTAMP(3) NOT NULL,
    "saved_at" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Score_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Team" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "banner_url" TEXT NOT NULL,
    "teamColor" "TeamColor" NOT NULL,
    "teamState" "TeamState" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "userState" "UserState" NOT NULL DEFAULT 'ACTIVE',
    "osuid" INTEGER NOT NULL,
    "username" TEXT NOT NULL,
    "avatar_url" TEXT,
    "cover_url" TEXT,
    "country_code" TEXT NOT NULL,
    "pp" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "global_rank" INTEGER NOT NULL DEFAULT 0,
    "country_rank" INTEGER NOT NULL DEFAULT 0,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "seed" INTEGER NOT NULL DEFAULT 0,
    "seasonal" "Season" NOT NULL DEFAULT 'S1',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserGroup" (
    "id" SERIAL NOT NULL,
    "group" "UserGroupType" NOT NULL DEFAULT 'PLAYER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TournamentConfig" (
    "id" SERIAL NOT NULL,
    "tournament_name" TEXT NOT NULL DEFAULT 'AstarCup',
    "max_pp_for_registration" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "min_pp_for_registration" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "current_seasonal" "Season" NOT NULL DEFAULT 'S1',
    "current_category" "Category" NOT NULL DEFAULT 'QUA',
    "canRegister" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TournamentConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_TeamToUser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_TeamToUser_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_UserToUserGroup" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_UserToUserGroup_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Beatmap_beatmap_id_key" ON "Beatmap"("beatmap_id");

-- CreateIndex
CREATE UNIQUE INDEX "Beatmap_beatmapset_id_key" ON "Beatmap"("beatmapset_id");

-- CreateIndex
CREATE UNIQUE INDEX "BeatmapComment_beatmap_id_key" ON "BeatmapComment"("beatmap_id");

-- CreateIndex
CREATE UNIQUE INDEX "BeatmapComment_osuid_key" ON "BeatmapComment"("osuid");

-- CreateIndex
CREATE UNIQUE INDEX "MultiplayerSoloRoom_player_red_id_key" ON "MultiplayerSoloRoom"("player_red_id");

-- CreateIndex
CREATE UNIQUE INDEX "MultiplayerSoloRoom_player_blue_id_key" ON "MultiplayerSoloRoom"("player_blue_id");

-- CreateIndex
CREATE UNIQUE INDEX "MultiplayerTeamvsRoom_team_red_id_key" ON "MultiplayerTeamvsRoom"("team_red_id");

-- CreateIndex
CREATE UNIQUE INDEX "MultiplayerTeamvsRoom_team_blue_id_key" ON "MultiplayerTeamvsRoom"("team_blue_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_osuid_key" ON "User"("osuid");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE INDEX "_TeamToUser_B_index" ON "_TeamToUser"("B");

-- CreateIndex
CREATE INDEX "_UserToUserGroup_B_index" ON "_UserToUserGroup"("B");

-- AddForeignKey
ALTER TABLE "Beatmap" ADD CONSTRAINT "Beatmap_selectByosuId_fkey" FOREIGN KEY ("selectByosuId") REFERENCES "User"("osuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BeatmapComment" ADD CONSTRAINT "BeatmapComment_beatmap_id_fkey" FOREIGN KEY ("beatmap_id") REFERENCES "Beatmap"("beatmap_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BeatmapComment" ADD CONSTRAINT "BeatmapComment_osuid_fkey" FOREIGN KEY ("osuid") REFERENCES "User"("osuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "User"("osuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "User"("osuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "MultiplayerRoom"("room_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MultiplayerRoom" ADD CONSTRAINT "MultiplayerRoom_multiplayerSoloRoomRoom_id_fkey" FOREIGN KEY ("multiplayerSoloRoomRoom_id") REFERENCES "MultiplayerSoloRoom"("room_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MultiplayerRoom" ADD CONSTRAINT "MultiplayerRoom_multiplayerTeamvsRoomRoom_id_fkey" FOREIGN KEY ("multiplayerTeamvsRoomRoom_id") REFERENCES "MultiplayerTeamvsRoom"("room_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MultiplayerSoloRoom" ADD CONSTRAINT "MultiplayerSoloRoom_player_red_id_fkey" FOREIGN KEY ("player_red_id") REFERENCES "User"("osuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MultiplayerSoloRoom" ADD CONSTRAINT "MultiplayerSoloRoom_player_blue_id_fkey" FOREIGN KEY ("player_blue_id") REFERENCES "User"("osuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MultiplayerTeamvsRoom" ADD CONSTRAINT "MultiplayerTeamvsRoom_team_red_id_fkey" FOREIGN KEY ("team_red_id") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MultiplayerTeamvsRoom" ADD CONSTRAINT "MultiplayerTeamvsRoom_team_blue_id_fkey" FOREIGN KEY ("team_blue_id") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TeamToUser" ADD CONSTRAINT "_TeamToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TeamToUser" ADD CONSTRAINT "_TeamToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserToUserGroup" ADD CONSTRAINT "_UserToUserGroup_A_fkey" FOREIGN KEY ("A") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserToUserGroup" ADD CONSTRAINT "_UserToUserGroup_B_fkey" FOREIGN KEY ("B") REFERENCES "UserGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
