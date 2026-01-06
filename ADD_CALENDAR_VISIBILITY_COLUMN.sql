-- Add show_on_calendar column to user_habits table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'user_habits' 
        AND column_name = 'show_on_calendar'
    ) THEN
        ALTER TABLE public.user_habits 
        ADD COLUMN show_on_calendar BOOLEAN DEFAULT true;
        
        -- Update existing habits to show on calendar by default
        UPDATE public.user_habits 
        SET show_on_calendar = true 
        WHERE show_on_calendar IS NULL;
    END IF;
END $$;

-- Add show_on_calendar column to user_toolbox_items table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'user_toolbox_items' 
        AND column_name = 'show_on_calendar'
    ) THEN
        ALTER TABLE public.user_toolbox_items 
        ADD COLUMN show_on_calendar BOOLEAN DEFAULT true;
        
        -- Update existing toolbox items to show on calendar by default
        UPDATE public.user_toolbox_items 
        SET show_on_calendar = true 
        WHERE show_on_calendar IS NULL;
    END IF;
END $$;

-- Add comment to columns
COMMENT ON COLUMN public.user_habits.show_on_calendar IS 'Whether this habit should be displayed on the calendar';
COMMENT ON COLUMN public.user_toolbox_items.show_on_calendar IS 'Whether this toolbox item should be displayed on the calendar';

