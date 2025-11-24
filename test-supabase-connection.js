const { createClient } = require('@supabase/supabase-js');

// Keys from src/lib/supabaseClient.js
const supabaseUrl = 'https://mbffycgrqfeesfnhhcdm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1iZmZ5Y2dycWZlZXNmbmhoY2RtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5NTEwOTQsImV4cCI6MjA3NDUyNzA5NH0.vRB4oPdeQ4bQBns1tOLEzoS6YWY-RjrK_t65y2D0hTM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
    console.log('🧪 Testing Supabase Connection...');
    console.log(`URL: ${supabaseUrl}`);

    try {
        // 1. Test Habits Library
        console.log('\n📚 Fetching Habits Library...');
        const { data: habits, error: habitsError } = await supabase
            .from('habits_library')
            .select('*');

        if (habitsError) {
            console.error('❌ Error fetching habits:', habitsError.message);
        } else {
            console.log(`✅ Success! Found ${habits.length} habits in library.`);
            if (habits.length > 0) {
                console.log('Sample habit:', habits[0].title);
            }
        }

        // 2. Test Toolbox Library
        console.log('\n🔧 Fetching Toolbox Library...');
        const { data: tools, error: toolsError } = await supabase
            .from('toolbox_library')
            .select('*');

        if (toolsError) {
            console.error('❌ Error fetching tools:', toolsError.message);
        } else {
            console.log(`✅ Success! Found ${tools.length} tools in library.`);
            if (tools.length > 0) {
                console.log('Sample tool:', tools[0].title);
            }
        }

    } catch (err) {
        console.error('❌ Unexpected error:', err);
    }
}

testConnection();
