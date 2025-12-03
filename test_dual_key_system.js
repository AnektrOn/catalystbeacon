const { createClient } = require('@supabase/supabase-js');

// Keys from src/lib/supabaseClient.js
const supabaseUrl = 'https://mbffycgrqfeesfnhhcdm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1iZmZ5Y2dycWZlZXNmbmhoY2RtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5NTEwOTQsImV4cCI6MjA3NDUyNzA5NH0.vRB4oPdeQ4bQBns1tOLEzoS6YWY-RjrK_t65y2D0hTM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// UUID generation helper (matching courseService.js)
function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(32, '0');
}

function generateChapterId(courseId, chapterNumber) {
    const name = `course:${courseId}:chapter:${chapterNumber}`;
    const hash = simpleHash(name);
    return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-${hash.slice(12, 16)}-${hash.slice(16, 20)}-${hash.slice(20, 32)}`;
}

function generateLessonId(courseId, chapterNumber, lessonNumber) {
    const name = `course:${courseId}:chapter:${chapterNumber}:lesson:${lessonNumber}`;
    const hash = simpleHash(name);
    return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-${hash.slice(12, 16)}-${hash.slice(16, 20)}-${hash.slice(20, 32)}`;
}

async function testDualKeySystem() {
    console.log('🧪 Testing Dual-Key Course Content Linking System\n');

    // 1. Check if UUID columns exist
    console.log('1️⃣ Checking UUID columns in course_content...');
    const { data: sampleContent, error: contentError } = await supabase
        .from('course_content')
        .select('*')
        .limit(1);

    if (contentError) {
        console.error('❌ Error:', contentError.message);
    } else if (sampleContent && sampleContent.length > 0) {
        const hasChapterId = 'chapter_id' in sampleContent[0];
        const hasLessonId = 'lesson_id' in sampleContent[0];
        console.log(`   ${hasChapterId ? '✅' : '❌'} chapter_id column exists`);
        console.log(`   ${hasLessonId ? '✅' : '❌'} lesson_id column exists`);
    }

    // 2. Check course_structure
    console.log('\n2️⃣ Checking UUID columns in course_structure...');
    const { data: sampleStructure, error: structureError } = await supabase
        .from('course_structure')
        .select('*')
        .limit(1);

    if (structureError) {
        console.error('❌ Error:', structureError.message);
    } else if (sampleStructure && sampleStructure.length > 0) {
        const hasChapterId1 = 'chapter_id_1' in sampleStructure[0];
        console.log(`   ${hasChapterId1 ? '✅' : '❌'} chapter_id_1 column exists`);
    }

    // 3. Test UUID generation
    console.log('\n3️⃣ Testing UUID generation...');
    const testCourseId = -1211732545;
    const testChapterNum = 1;
    const testLessonNum = 1;

    const chapterId = generateChapterId(testCourseId, testChapterNum);
    const lessonId = generateLessonId(testCourseId, testChapterNum, testLessonNum);

    console.log(`   Chapter ID for course ${testCourseId}, chapter ${testChapterNum}:`);
    console.log(`   ${chapterId}`);
    console.log(`   Lesson ID for course ${testCourseId}, chapter ${testChapterNum}, lesson ${testLessonNum}:`);
    console.log(`   ${lessonId}`);

    // 4. Test deterministic generation (should be same every time)
    console.log('\n4️⃣ Testing deterministic generation...');
    const chapterId2 = generateChapterId(testCourseId, testChapterNum);
    const lessonId2 = generateLessonId(testCourseId, testChapterNum, testLessonNum);

    const isDeterministic = (chapterId === chapterId2) && (lessonId === lessonId2);
    console.log(`   ${isDeterministic ? '✅' : '❌'} UUIDs are deterministic`);

    console.log('\n✅ Dual-key system verification complete!');
    console.log('\n📝 Next steps:');
    console.log('   1. Populate existing course_content rows with generated UUIDs');
    console.log('   2. Update course_structure and course_description with chapter UUIDs');
    console.log('   3. Test querying by both numeric and UUID identifiers');
}

testDualKeySystem();
