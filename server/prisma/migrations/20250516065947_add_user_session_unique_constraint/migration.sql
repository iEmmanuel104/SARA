/*
  Warnings:

  - A unique constraint covering the columns `[userId,sessionId]` on the table `AiConversation` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "AiConversation_userId_sessionId_key" ON "AiConversation"("userId", "sessionId");
