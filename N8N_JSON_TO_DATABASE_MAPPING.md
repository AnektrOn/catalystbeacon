# N8N JSON to Database Mapping Guide

## Overview

This guide shows how to map your N8N JSON structure to the existing denormalized database tables.

## JSON Structure

```json
[
  {
    "courseTitle": "...",
    "chapters": [
      {
        "chapterTitle": "...",
        "chapterOverview": "...",
        "lessons": [
          {
            "lessonTitle": "...",
            "lessonId": "C1-CH1-L1",
            "content": {
              "hook": "...",
              "keyTerms": [...],
              "coreConcepts": [...],
              "synthesis": "...",
              "connectToYourLife": "...",
              "takeaways": [...]
            }
          }
        ]
      }
    ]
  }
]
```

## Table Mapping Order

### 1. course_metadata (Insert First)

**N8N Supabase Node: Insert into `course_metadata`**

| JSON Field | Database Column | Notes |
|------------|----------------|-------|
| `courseTitle` | `course_title` | Required |
| - | `course_id` | Generate hash from courseTitle (your existing code) |
| - | `school_name` | Set default or from your categorization |
| - | `masterschool` | From your Gemini categorization |
| - | `difficulty_level` | From your Gemini categorization |
| - | `xp_threshold` | From your XP calculation |
| - | `stats_linked` | From your Gemini categorization (selected_skills) |
| - | `status` | Set to `'published'` |

**Example N8N Fields:**
```
course_id: {{ $json.courseId }}  (from your hash function)
course_title: {{ $json.courseTitle }}
school_name: {{ $json.institute_name }}
masterschool: {{ $json.core_node }}
difficulty_level: {{ $json.difficulty_layer }}
xp_threshold: {{ $json.xp_rewarded }}
stats_linked: {{ $json.selected_skills }}
status: published
```

---

### 2. course_structure (Insert Second)

**N8N Supabase Node: Insert into `course_structure`**

This table stores the chapter and lesson titles in denormalized columns.

**Mapping Logic:**
- Loop through `chapters` array (index 0-4, max 5 chapters)
- For each chapter, map to `chapter_title_1`, `chapter_title_2`, etc.
- Loop through `lessons` array (index 0-3, max 4 lessons per chapter)
- Map to `lesson_1_1`, `lesson_1_2`, etc.

**N8N Code Node to Transform JSON:**

```javascript
const courseData = $input.first().json;
const courseId = courseData.courseId; // From previous step
const chapters = courseData.chapters || [];

// Initialize structure object
const structure = {
  id: courseId, // Use course_id as id
  course_id: courseId,
  chapter_count: chapters.length
};

// Map chapters and lessons
chapters.forEach((chapter, chapterIdx) => {
  const chapterNum = chapterIdx + 1;
  if (chapterNum > 5) return; // Max 5 chapters
  
  // Set chapter title
  structure[`chapter_title_${chapterNum}`] = chapter.chapterTitle;
  
  // Generate chapter ID (use your existing hash function)
  const chapterId = stringToHash(chapter.chapterTitle);
  structure[`chapter_id_${chapterNum}`] = chapterId;
  
  // Map lessons (max 4 per chapter)
  const lessons = chapter.lessons || [];
  lessons.forEach((lesson, lessonIdx) => {
    const lessonNum = lessonIdx + 1;
    if (lessonNum > 4) return; // Max 4 lessons
    
    structure[`lesson_${chapterNum}_${lessonNum}`] = lesson.lessonTitle;
  });
});

return [{ json: structure }];

// Your existing hash function
function stringToHash(str) {
  let hash = 0;
  if (str.length === 0) return '00000000';
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  let hex = (hash >>> 0).toString(16);
  return ('00000000' + hex).slice(-8);
}
```

**N8N Supabase Node Fields:**
```
id: {{ $json.id }}
course_id: {{ $json.course_id }}
chapter_count: {{ $json.chapter_count }}
chapter_title_1: {{ $json.chapter_title_1 }}
lesson_1_1: {{ $json.lesson_1_1 }}
lesson_1_2: {{ $json.lesson_1_2 }}
lesson_1_3: {{ $json.lesson_1_3 }}
lesson_1_4: {{ $json.lesson_1_4 }}
chapter_id_1: {{ $json.chapter_id_1 }}
// ... repeat for chapters 2-5
```

---

### 3. course_description (Insert Third)

**N8N Supabase Node: Insert into `course_description`**

This table stores chapter overviews and lesson descriptions.

**N8N Code Node to Transform JSON:**

```javascript
const courseData = $input.first().json;
const courseId = courseData.courseId;
const chapters = courseData.chapters || [];

const description = {
  id: courseId, // Use course_id as id
  course_id: courseId
};

chapters.forEach((chapter, chapterIdx) => {
  const chapterNum = chapterIdx + 1;
  if (chapterNum > 5) return;
  
  // Set chapter overview
  description[`chapter_${chapterNum}_description`] = chapter.chapterOverview || null;
  
  // Generate chapter ID
  const chapterId = stringToHash(chapter.chapterTitle);
  description[`chapter_id_${chapterNum}`] = chapterId;
  
  // Note: Your JSON doesn't have lesson descriptions, so leave those null
  // If you add them later, map them here:
  // description[`lesson_${chapterNum}_${lessonNum}_description`] = lesson.description;
});

return [{ json: description }];
```

**N8N Supabase Node Fields:**
```
id: {{ $json.id }}
course_id: {{ $json.course_id }}
chapter_1_description: {{ $json.chapter_1_description }}
chapter_id_1: {{ $json.chapter_id_1 }}
// ... repeat for chapters 2-5
```

---

### 4. course_content (Insert Last - One Row Per Lesson)

**N8N: Loop Through All Lessons**

For each lesson, create a separate row in `course_content`.

**N8N Code Node to Extract Lessons:**

```javascript
const courseData = $input.first().json;
const courseId = courseData.courseId;
const chapters = courseData.chapters || [];

const lessons = [];

chapters.forEach((chapter, chapterIdx) => {
  const chapterNum = chapterIdx + 1;
  const chapterTitle = chapter.chapterTitle;
  const chapterId = stringToHash(chapterTitle);
  
  (chapter.lessons || []).forEach((lesson, lessonIdx) => {
    const lessonNum = lessonIdx + 1;
    const content = lesson.content || {};
    
    lessons.push({
      lesson_id: lesson.lessonId || `${chapterNum}_${lessonNum}`,
      course_id: courseId,
      chapter_number: chapterNum,
      lesson_number: lessonNum,
      lesson_title: lesson.lessonTitle,
      the_hook: content.hook || null,
      
      // Key terms (max 4)
      key_terms_1: content.keyTerms?.[0]?.term || null,
      key_terms_1_def: content.keyTerms?.[0]?.definition || null,
      key_terms_2: content.keyTerms?.[1]?.term || null,
      key_terms_2_def: content.keyTerms?.[1]?.definition || null,
      key_terms_3: content.keyTerms?.[2]?.term || null,
      key_terms_3_def: content.keyTerms?.[2]?.definition || null,
      key_terms_4: content.keyTerms?.[3]?.term || null,
      key_terms_4_def: content.keyTerms?.[3]?.definition || null,
      
      // Core concepts (max 4)
      core_concepts_1: content.coreConcepts?.[0]?.title || null,
      core_concepts_1_def: content.coreConcepts?.[0]?.explanation || null,
      core_concepts_2: content.coreConcepts?.[1]?.title || null,
      core_concepts_2_def: content.coreConcepts?.[1]?.explanation || null,
      core_concepts_3: content.coreConcepts?.[2]?.title || null,
      core_concepts_3_def: content.coreConcepts?.[2]?.explanation || null,
      core_concepts_4: content.coreConcepts?.[3]?.title || null,
      core_concepts_4_def: content.coreConcepts?.[3]?.explanation || null,
      
      // Synthesis and connection
      synthesis: content.synthesis || null,
      connect_to_your_life: content.connectToYourLife || null,
      
      // Takeaways (max 4)
      key_takeaways_1: content.takeaways?.[0] || null,
      key_takeaways_2: content.takeaways?.[1] || null,
      key_takeaways_3: content.takeaways?.[2] || null,
      key_takeaways_4: content.takeaways?.[3] || null,
      
      // Additional fields
      attached_to_chapter: chapterTitle,
      attached_to_course: courseData.courseTitle,
      chapter_id: chapterId
    });
  });
});

return lessons.map(lesson => ({ json: lesson }));
```

**N8N Supabase Node Fields (for each lesson):**
```
lesson_id: {{ $json.lesson_id }}
course_id: {{ $json.course_id }}
chapter_number: {{ $json.chapter_number }}
lesson_number: {{ $json.lesson_number }}
lesson_title: {{ $json.lesson_title }}
the_hook: {{ $json.the_hook }}
key_terms_1: {{ $json.key_terms_1 }}
key_terms_1_def: {{ $json.key_terms_1_def }}
key_terms_2: {{ $json.key_terms_2 }}
key_terms_2_def: {{ $json.key_terms_2_def }}
key_terms_3: {{ $json.key_terms_3 }}
key_terms_3_def: {{ $json.key_terms_3_def }}
key_terms_4: {{ $json.key_terms_4 }}
key_terms_4_def: {{ $json.key_terms_4_def }}
core_concepts_1: {{ $json.core_concepts_1 }}
core_concepts_1_def: {{ $json.core_concepts_1_def }}
core_concepts_2: {{ $json.core_concepts_2 }}
core_concepts_2_def: {{ $json.core_concepts_2_def }}
core_concepts_3: {{ $json.core_concepts_3 }}
core_concepts_3_def: {{ $json.core_concepts_3_def }}
core_concepts_4: {{ $json.core_concepts_4 }}
core_concepts_4_def: {{ $json.core_concepts_4_def }}
synthesis: {{ $json.synthesis }}
connect_to_your_life: {{ $json.connect_to_your_life }}
key_takeaways_1: {{ $json.key_takeaways_1 }}
key_takeaways_2: {{ $json.key_takeaways_2 }}
key_takeaways_3: {{ $json.key_takeaways_3 }}
key_takeaways_4: {{ $json.key_takeaways_4 }}
attached_to_chapter: {{ $json.attached_to_chapter }}
attached_to_course: {{ $json.attached_to_course }}
chapter_id: {{ $json.chapter_id }}
```

---

## Complete N8N Workflow Order

1. **Parse JSON** - Extract courseTitle, chapters array
2. **Generate Course ID** - Hash courseTitle (your existing code)
3. **Insert course_metadata** - Get course_id
4. **Transform for course_structure** - Map chapters/lessons to denormalized columns
5. **Insert course_structure** - One row per course
6. **Transform for course_description** - Map chapter overviews
7. **Insert course_description** - One row per course
8. **Loop through lessons** - Extract all lessons from all chapters
9. **Insert course_content** - One row per lesson (use "Loop Over Items")

---

## Important Notes

### Limits
- **Max 5 chapters** per course (chapter_title_1 through chapter_title_5)
- **Max 4 lessons** per chapter (lesson_1_1 through lesson_1_4)
- **Max 4 key terms** (key_terms_1 through key_terms_4)
- **Max 4 core concepts** (core_concepts_1 through core_concepts_4)
- **Max 4 takeaways** (key_takeaways_1 through key_takeaways_4)

### Handling More Items
If your JSON has more than 4 key terms/concepts/takeaways:
- Take only the first 4 items
- Or concatenate them into a single field
- Or store extras in a separate JSONB column (would require schema change)

### Chapter/Lesson IDs
- Use your existing hash function to generate `chapter_id_1`, `chapter_id_2`, etc.
- The `lesson_id` in course_content can use the `lessonId` from JSON or generate it

### Error Handling
- Check if course_metadata already exists (upsert or skip)
- Handle missing optional fields (use `|| null`)
- Validate chapter/lesson counts before inserting

---

## Quick Reference: Field Mapping

| JSON Path | Table | Column | Max Items |
|-----------|-------|--------|-----------|
| `courseTitle` | course_metadata | course_title | 1 |
| `chapters[i].chapterTitle` | course_structure | chapter_title_{i+1} | 5 |
| `chapters[i].chapterOverview` | course_description | chapter_{i+1}_description | 5 |
| `chapters[i].lessons[j].lessonTitle` | course_structure | lesson_{i+1}_{j+1} | 4 per chapter |
| `chapters[i].lessons[j].content.hook` | course_content | the_hook | 1 per lesson |
| `chapters[i].lessons[j].content.keyTerms[0]` | course_content | key_terms_1, key_terms_1_def | 4 |
| `chapters[i].lessons[j].content.coreConcepts[0]` | course_content | core_concepts_1, core_concepts_1_def | 4 |
| `chapters[i].lessons[j].content.takeaways[0]` | course_content | key_takeaways_1 | 4 |

---

## Example: Complete N8N Node Sequence

```
1. Webhook/Trigger
   ↓
2. Code: Extract courseTitle, generate courseId
   ↓
3. Supabase: Insert course_metadata
   ↓
4. Code: Transform for course_structure
   ↓
5. Supabase: Insert course_structure
   ↓
6. Code: Transform for course_description
   ↓
7. Supabase: Insert course_description
   ↓
8. Code: Extract all lessons (flatten chapters)
   ↓
9. Split Out: Split lessons array
   ↓
10. Loop Over Items: For each lesson
    ↓
11. Supabase: Insert course_content
```

This matches your existing workflow structure!
