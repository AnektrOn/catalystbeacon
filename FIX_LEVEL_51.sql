
-- Fix for Level 51 XP Threshold
-- Currently set to 20,000 XP which breaks progression (Level 50 is 3.5M XP)
-- Setting to 4,000,000 XP to follow the progression pattern

UPDATE levels 
SET xp_threshold = 4000000 
WHERE level_number = 51;

-- Verify the change
SELECT * FROM levels WHERE level_number = 51;
