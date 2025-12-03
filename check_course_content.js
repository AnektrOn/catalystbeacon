const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://mbffycgrqfeesfnhhcdm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1iZmZ5Y2dycWZlZXNmbmhoY2RtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5NTEwOTQsImV4cCI6MjA3NDUyNzA5NH0.vRB4oPdeQ4bQBns1tOLEzoS6YWY-RjrK_t65y2D0hTM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkCourseContent() {
    console.log('🔍 Checking course_content table...\n');

    // Check if table exists and has data
    const { data, error, count } = await supabase
        .from('course_content')
        .select('*', { count: 'exact' })
        .limit(5);

    if (error) {
        console.error('❌ Error:', error.message);
        return;
    }

    console.log(`📊 Total rows in course_content: ${count}`);

    if (data && data.length > 0) {
        console.log('\n✅ Sample data found:');
        data.forEach((row, i) => {
            console.log(`\n${i + 1}. Course ID: ${row.course_id}, Chapter: ${row.chapter_number}, Lesson: ${row.lesson_number}`);
            console.log(`   Title: ${row.lesson_title || 'N/A'}`);
            console.log(`   Has content: ${row.the_hook ? 'Yes' : 'No'}`);
        });
    } else {
        console.log('\n❌ No data found in course_content table!');
        console.log('\n📝 This is why lessons appear empty.');
        console.log('   You need to import your CSV data into the course_content table.');
    }

    // Check course_structure
    console.log('\n\n🔍 Checking course_structure table...\n');
    const { data: structureData, error: structureError, count: structureCount } = await supabase
        .from('course_structure')
        .select('*', { count: 'exact' })
        .limit(3);

    if (structureError) {
        console.error('❌ Error:', structureError.message);
    } else {
        console.log(`📊 Total rows in course_structure: ${structureCount}`);
        if (structureData && structureData.length > 0) {
            console.log('\n✅ Sample structure:');
            structureData.forEach((row, i) => {
                console.log(`\n${i + 1}. Course ID: ${row.course_id}`);
                console.log(`   Chapters: ${row.chapter_count}`);
                console.log(`   Chapter 1: ${row.chapter_title_1 || 'N/A'}`);
            });
        }
    }

    // Check course_metadata
    console.log('\n\n🔍 Checking course_metadata table...\n');
    const { data: metadataData, error: metadataError, count: metadataCount } = await supabase
        .from('course_metadata')
        .select('course_id, course_title, masterschool', { count: 'exact' })
        .limit(5);

    if (metadataError) {
        console.error('❌ Error:', metadataError.message);
    } else {
        console.log(`📊 Total courses in course_metadata: ${metadataCount}`);
        if (metadataData && metadataData.length > 0) {
            console.log('\n✅ Available courses:');
            metadataData.forEach((row, i) => {
                console.log(`${i + 1}. [${row.course_id}] ${row.course_title} (${row.masterschool})`);
            });
        }
    }
}

checkCourseContent();
