-- Use a placeholder value to update all existing NULL usernames
UPDATE "User"
SET "username" = 'user_' || "id"
WHERE "username" IS NULL;

-- Now, make the username column not nullable
ALTER TABLE "User" ALTER COLUMN "username" SET NOT NULL;