
const { createClient } = require('@supabase/supabase-js');

// Keys from src/lib/supabaseClient.js
const supabaseUrl = 'https://mbffycgrqfeesfnhhcdm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1iZmZ5Y2dycWZlZXNmbmhoY2RtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5NTEwOTQsImV4cCI6MjA3NDUyNzA5NH0.vRB4oPdeQ4bQBns1tOLEzoS6YWY-RjrK_t65y2D0hTM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fixLevel51() {
    console.log('Attempting to fix Level 51 on project: ' + supabaseUrl);

    // 1. Check current value
    const { data: level, error: fetchError } = await supabase
        .from('levels')
        .select('*')
        .eq('level_number', 51)
        .single();

    if (fetchError) {
        console.error('❌ Error fetching Level 51:', fetchError.message);
        return;
    }

    console.log(`Current Level 51: ${level.xp_threshold} XP`);

    if (level.xp_threshold < 3500000) {
        console.log('⚠️ Level 51 threshold is too low. Attempting to update to 4,000,000 XP...');

        const { data, error: updateError } = await supabase
            .from('levels')
            .update({ xp_threshold: 4000000 })
            .eq('level_number', 51)
            .select();

        if (updateError) {
            console.error('❌ Update failed:', updateError.message);
            console.log('ℹ️ You likely need to run this SQL in the Supabase Dashboard:');
            console.log('UPDATE levels SET xp_threshold = 4000000 WHERE level_number = 51;');
        } else {
            console.log('✅ Update successful!', data);
        }
    } else {
        console.log('✅ Level 51 threshold seems correct.');
    }
}

fixLevel51();
