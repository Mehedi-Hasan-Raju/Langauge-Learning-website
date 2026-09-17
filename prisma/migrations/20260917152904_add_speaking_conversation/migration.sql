-- CreateTable
CREATE TABLE "SpeakingConversation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "practiceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SpeakingConversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpeakingConversationMessage" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SpeakingConversationMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SpeakingConversation_userId_idx" ON "SpeakingConversation"("userId");

-- CreateIndex
CREATE INDEX "SpeakingConversation_practiceId_idx" ON "SpeakingConversation"("practiceId");

-- CreateIndex
CREATE INDEX "SpeakingConversation_userId_practiceId_idx" ON "SpeakingConversation"("userId", "practiceId");

-- CreateIndex
CREATE INDEX "SpeakingConversationMessage_conversationId_idx" ON "SpeakingConversationMessage"("conversationId");

-- CreateIndex
CREATE INDEX "SpeakingConversationMessage_conversationId_createdAt_idx" ON "SpeakingConversationMessage"("conversationId", "createdAt");

-- AddForeignKey
ALTER TABLE "SpeakingConversation" ADD CONSTRAINT "SpeakingConversation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpeakingConversation" ADD CONSTRAINT "SpeakingConversation_practiceId_fkey" FOREIGN KEY ("practiceId") REFERENCES "SpeakingPractice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpeakingConversationMessage" ADD CONSTRAINT "SpeakingConversationMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "SpeakingConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
