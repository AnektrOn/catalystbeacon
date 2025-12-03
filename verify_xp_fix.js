
const { createClient } = require('@supabase/supabase-js');

// Keys from src/lib/supabaseClient.js
const supabaseUrl = 'https://mbffycgrqfeesfnhhcdm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1iZmZ5Y2dycWZlZXNmbmhoY2RtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5NTEwOTQsImV4cCI6MjA3NDUyNzA5NH0.vRB4oPdeQ4bQBns1tOLEzoS6YWY-RjrK_t65y2D0hTM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verify() {
    console.log('Verifying XP Thresholds on project: ' + supabaseUrl);

    // 1. Verify Schools
    console.log('\nChecking Schools...');
    const { data: schools, error: schoolsError } = await supabase
        .from('schools')
        .select('*')
        .order('unlock_xp');

    if (schoolsError) {
        console.error('❌ Error fetching schools:', schoolsError.message);
    } else {
        console.log(`✅ Found ${schools.length} schools:`);
        schools.forEach(s => console.log(`   - ${s.name}: ${s.unlock_xp} XP`));
    }

    // 2. Verify Levels
    console.log('\nChecking Levels...');
    const { data: levels, error: levelsError } = await supabase
        .from('levels')
        .select('*')
        .order('level_number');

    if (levelsError) {
        console.error('❌ Error fetching levels:', levelsError.message);
    } else {
        console.log(`✅ Found ${levels.length} levels:`);
        // Print first 10 and last 5
        const toPrint = [...levels.slice(0, 10), ...levels.slice(-5)];
        toPrint.forEach(l => console.log(`   - Level ${l.level_number}: ${l.xp_threshold} XP`));
    }
}

verify();
