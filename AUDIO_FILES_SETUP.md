# Audio Files Setup Guide

## Required Audio Files

To enable sound effects in the Matrix Entry experience, you need to add the following audio files to `/public/assets/`:

### 1. Call Audio (Already exists)
- **File**: `Voix 2 Entry.mp3`
- **Path**: `/public/assets/Voix 2 Entry.mp3`
- **Usage**: Plays when user accepts the call in ACT 3
- **Status**: ✅ File exists (may need URL encoding for spaces)

### 2. Notification Sound (NEW)
- **File**: `notification.mp3`
- **Path**: `/public/assets/notification.mp3`
- **Usage**: Plays each time a notification appears in ACT 1
- **Format**: MP3, WAV, or OGG
- **Duration**: 0.5-1 second recommended
- **Volume**: Medium (not too loud)

### 3. Incoming Call Sound (NEW)
- **File**: `incoming-call.mp3`
- **Path**: `/public/assets/incoming-call.mp3`
- **Usage**: Loops continuously when ACT 3 shows incoming call UI
- **Format**: MP3, WAV, or OGG
- **Duration**: 2-4 seconds (will loop)
- **Volume**: Medium

## Quick Setup

### Option 1: Use iOS System Sounds (Recommended)

You can use iOS notification and call sounds:

1. Download iOS sound files:
   - Notification: `Note.mp3` or `Tri-tone.mp3`
   - Incoming Call: `Marimba.mp3` or `Opening.mp3`

2. Rename and place in `/public/assets/`:
   ```
   /public/assets/notification.mp3
   /public/assets/incoming-call.mp3
   ```

### Option 2: Generate Simple Tones

You can create simple audio tones using online tools:

1. **Notification Sound**:
   - Frequency: 800Hz
   - Duration: 0.3s
   - Waveform: Sine or Triangle
   - Fade out: Yes

2. **Incoming Call Sound**:
   - Frequency: 400Hz alternating with 500Hz
   - Duration: 2s
   - Waveform: Sine
   - Loop: Yes

### Option 3: Use Silent Placeholders

If you don't want sounds, the code will gracefully handle missing files (no errors).

## File Naming Notes

⚠️ **Important**: The current call audio file has a space in the name (`Voix 2 Entry.mp3`). 

If you encounter issues, consider:
1. Renaming to `Voix2Entry.mp3` (no spaces)
2. Or URL-encoding the space: `Voix%202%20Entry.mp3`

## Testing

After adding the files:

1. Clear browser cache
2. Restart dev server: `npm run dev`
3. Test ACT 1: Should hear notification sounds
4. Test ACT 3: Should hear incoming call sound (looping)

## Error Handling

The code includes error handling:
- Missing files won't crash the app
- Console warnings will appear if files are missing
- Audio will gracefully fail if browser blocks autoplay

## Browser Autoplay Policy

⚠️ **Note**: Modern browsers block autoplay audio. Users may need to interact with the page first before sounds play.

The code handles this gracefully - sounds will play when:
- User clicks/interacts with the page
- Or when user accepts the call (user interaction)
