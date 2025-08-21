-- Add RLS policies for the user_favorites table (it may already exist but let's ensure proper coverage)
DO $$
BEGIN
    -- Check if RLS is enabled and enable if not
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'user_favorites'
        AND rowsecurity = true
    ) THEN
        ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
    END IF;

    -- Create policies if they don't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'user_favorites' 
        AND policyname = 'Users can view their own favorites'
    ) THEN
        CREATE POLICY "Users can view their own favorites" 
        ON user_favorites 
        FOR SELECT 
        USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'user_favorites' 
        AND policyname = 'Users can create their own favorites'
    ) THEN
        CREATE POLICY "Users can create their own favorites" 
        ON user_favorites 
        FOR INSERT 
        WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'user_favorites' 
        AND policyname = 'Users can delete their own favorites'
    ) THEN
        CREATE POLICY "Users can delete their own favorites" 
        ON user_favorites 
        FOR DELETE 
        USING (auth.uid() = user_id);
    END IF;
END $$;