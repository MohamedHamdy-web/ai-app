-- Placeholder migration for 20260410165943_add_billing_fields
-- This file was recreated to allow prisma migrate resolve to mark the migration as applied.
-- If you have the original migration SQL, replace this content with the original statements.

-- Reconstructed migration: add billing/quota columns to User and ensure Chat.updatedAt default
BEGIN;

-- Add billing / quota columns to User (if not already present)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "quotaLimit" INTEGER NOT NULL DEFAULT 1000;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "quotaResetAt" TIMESTAMP WITH TIME ZONE;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "quotaUsed" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "stripeCustomerId" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "stripeSubscriptionId" TEXT;

-- Ensure Chat.updatedAt has a default of now()
ALTER TABLE "Chat" ALTER COLUMN "updatedAt" SET DEFAULT now();

COMMIT;
