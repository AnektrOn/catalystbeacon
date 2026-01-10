# Get Logo File from Production

Since the logo file `/assets/Logo uni.png` exists in production but not locally, you have two options:

## Option 1: Download from Production (Recommended)

SSH into your production server and copy the file:

```bash
# On production server
cd ~/domains/humancatalystbeacon.com/public_html/app
scp public/assets/Logo\ uni.png your-local-machine:/Users/conesaleo/hcuniversity/hcuniversity/public/assets/
```

Or download via SFTP/FTP client:
- Source: `public/assets/Logo uni.png` on production server
- Destination: `public/assets/Logo uni.png` in your local project

## Option 2: Use Fallback Logo Locally

The code now uses `/assets/Logo uni.png` which will work in production. For local development, you can:

1. **Copy an existing logo** as a placeholder:
   ```bash
   cp public/hc-logo.svg public/assets/Logo\ uni.png
   ```
   (Note: This creates an SVG with PNG extension - not ideal but works for testing)

2. **Or use the existing logo** by temporarily changing the path in development mode

## Quick Fix for Now

The code is already set to use `/assets/Logo uni.png`. Just make sure the file exists in `public/assets/` locally, or the app will show a broken image (but won't crash).

To get the actual file from production, use Option 1 above.
