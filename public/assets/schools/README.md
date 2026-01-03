# School Background Images

This directory contains background images for each school_name.

## File Naming Convention

Name your images using the exact school_name value from the database, in lowercase with hyphens:
- Example: If school_name is "Institute", name the file: `institute-bg.jpg`
- Example: If school_name is "Mental Fitness", name the file: `mental-fitness-bg.jpg`

## Supported Formats

- `.jpg` / `.jpeg`
- `.png`
- `.webp`

## Image Specifications

Recommended dimensions:
- **Width**: 1200px - 2000px
- **Height**: 800px - 1200px
- **Aspect Ratio**: 3:2 or 16:9
- **File Size**: Under 500KB (optimize for web)

## Usage

After adding images, update the `getSchoolBackgroundImage` function in `src/pages/CourseCatalogPage.jsx`:

```javascript
const schoolImageMap = {
  'Institute': '/assets/schools/institute-bg.jpg',
  'Mental Fitness': '/assets/schools/mental-fitness-bg.jpg',
  // Add more mappings here
};
```

## Notes

- Images will be displayed as background on mobile course cards
- A gradient overlay is automatically applied for text readability
- Images should have good contrast for text overlay

