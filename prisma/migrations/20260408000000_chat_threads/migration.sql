-- CreateEnum
CREATE TYPE "MessageRole" AS ENUM ('user', 'assistant');

-- CreateTable
CREATE TABLE "Chat" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'New chat',
    "toolId" TEXT NOT NULL DEFAULT 'text',
    "guestSessionId" TEXT,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Chat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "role" "MessageRole" NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "chatId" TEXT NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Chat_guestSessionId_idx" ON "Chat"("guestSessionId");

-- CreateIndex
CREATE INDEX "Chat_userId_idx" ON "Chat"("userId");

-- CreateIndex
CREATE INDEX "Chat_updatedAt_idx" ON "Chat"("updatedAt");

-- CreateIndex
CREATE INDEX "Message_chatId_createdAt_idx" ON "Message"("chatId", "createdAt");

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Migrate existing prompt/result history into standalone chats.
INSERT INTO "Chat" ("id", "title", "toolId", "userId")
SELECT
  "id",
  LEFT(REGEXP_REPLACE("prompt", E'\\s+', ' ', 'g'), 80),
  'text',
  "userId"
FROM "History";

INSERT INTO "Message" ("id", "role", "content", "createdAt", "chatId")
SELECT
  "id" || '_user',
  'user',
  "prompt",
  CURRENT_TIMESTAMP,
  "id"
FROM "History";

INSERT INTO "Message" ("id", "role", "content", "createdAt", "chatId")
SELECT
  "id" || '_assistant',
  'assistant',
  "result",
  CURRENT_TIMESTAMP + INTERVAL '1 millisecond',
  "id"
FROM "History";
