-- CreateEnum
CREATE TYPE "status" AS ENUM ('Online', 'Offline', 'Ingame', 'Busy');

-- CreateEnum
CREATE TYPE "request" AS ENUM ('Pending', 'Accepted', 'Refused');

-- CreateEnum
CREATE TYPE "channel_type" AS ENUM ('Private', 'Public', 'Protected');

-- CreateTable
CREATE TABLE "user" (
    "userID" SERIAL NOT NULL,
    "nickname" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "avatar" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "status" "status" NOT NULL,
    "admin" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "user_pkey" PRIMARY KEY ("userID")
);

-- CreateTable
CREATE TABLE "match_history" (
    "matchID" SERIAL NOT NULL,
    "winnerScore" INTEGER NOT NULL,
    "loserScore" INTEGER NOT NULL,
    "dateOfMatch" TIMESTAMP(3) NOT NULL,
    "winnerName" TEXT NOT NULL,
    "loserName" TEXT NOT NULL,

    CONSTRAINT "match_history_pkey" PRIMARY KEY ("matchID")
);

-- CreateTable
CREATE TABLE "friend_list" (
    "id" SERIAL NOT NULL,
    "userString" TEXT NOT NULL,
    "friendString" TEXT NOT NULL,
    "status" "request" NOT NULL,

    CONSTRAINT "friend_list_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "block_list" (
    "id" SERIAL NOT NULL,
    "userString" TEXT NOT NULL,
    "blockedUserSting" TEXT NOT NULL,

    CONSTRAINT "block_list_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "private_chat" (
    "id" SERIAL NOT NULL,
    "senderString" TEXT NOT NULL,
    "receiverString" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "private_chat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "channel" (
    "channelName" TEXT NOT NULL,
    "type" "channel_type" NOT NULL,
    "password" TEXT DEFAULT '',

    CONSTRAINT "channel_pkey" PRIMARY KEY ("channelName")
);

-- CreateTable
CREATE TABLE "channel_user" (
    "id" SERIAL NOT NULL,
    "channelID" TEXT NOT NULL,
    "userString" TEXT NOT NULL,
    "admin" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "channel_user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "channel_chat" (
    "id" SERIAL NOT NULL,
    "channelID" TEXT NOT NULL,
    "senderName" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "timeStamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "channel_chat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_nickname_key" ON "user"("nickname");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_token_key" ON "user"("token");

-- AddForeignKey
ALTER TABLE "match_history" ADD CONSTRAINT "match_history_winnerName_fkey" FOREIGN KEY ("winnerName") REFERENCES "user"("nickname") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_history" ADD CONSTRAINT "match_history_loserName_fkey" FOREIGN KEY ("loserName") REFERENCES "user"("nickname") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friend_list" ADD CONSTRAINT "friend_list_userString_fkey" FOREIGN KEY ("userString") REFERENCES "user"("nickname") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friend_list" ADD CONSTRAINT "friend_list_friendString_fkey" FOREIGN KEY ("friendString") REFERENCES "user"("nickname") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "block_list" ADD CONSTRAINT "block_list_userString_fkey" FOREIGN KEY ("userString") REFERENCES "user"("nickname") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "block_list" ADD CONSTRAINT "block_list_blockedUserSting_fkey" FOREIGN KEY ("blockedUserSting") REFERENCES "user"("nickname") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "private_chat" ADD CONSTRAINT "private_chat_senderString_fkey" FOREIGN KEY ("senderString") REFERENCES "user"("nickname") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "private_chat" ADD CONSTRAINT "private_chat_receiverString_fkey" FOREIGN KEY ("receiverString") REFERENCES "user"("nickname") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "channel_user" ADD CONSTRAINT "channel_user_channelID_fkey" FOREIGN KEY ("channelID") REFERENCES "channel"("channelName") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "channel_user" ADD CONSTRAINT "channel_user_userString_fkey" FOREIGN KEY ("userString") REFERENCES "user"("nickname") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "channel_chat" ADD CONSTRAINT "channel_chat_channelID_fkey" FOREIGN KEY ("channelID") REFERENCES "channel"("channelName") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "channel_chat" ADD CONSTRAINT "channel_chat_senderName_fkey" FOREIGN KEY ("senderName") REFERENCES "user"("nickname") ON DELETE RESTRICT ON UPDATE CASCADE;
