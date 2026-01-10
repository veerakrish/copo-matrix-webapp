# Vercel Build Error Fix

## Problem
Error: Command "cd client && npm install && npm run build" exited with 1

## Solution

Vercel auto-detects Vite, so you don't need to specify build commands in `vercel.json`. Configure it in the Vercel dashboard instead.

## Step-by-Step Fix

### Option 1: Configure in Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard** → Your Project → **Settings**

2. **General Settings**:
   - **Root Directory**: Click "Edit" → Select `client` folder
   - **Framework Preset**: `Vite` (should auto-detect)
   - **Build Command**: Leave empty (auto: `npm run build`)
   - **Output Directory**: Leave empty (auto: `dist`)
   - **Install Command**: Leave empty (auto: `npm install`)

3. **Environment Variables**:
   - Add: `VITE_API_URL` = your Render backend URL
   - Example: `https://copo-matrix-backend.onrender.com`

4. **Save and Redeploy**

### Option 2: Use vercel.json (Alternative)

If you want to keep configuration in code, update `vercel.json`:

```json
{
  "buildCommand": "npm install && npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://your-backend-url.onrender.com/api/$1"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**But you still need to set Root Directory to `client` in Vercel dashboard!**

## Recommended: Remove vercel.json Entirely

Actually, the simplest approach:

1. **Delete or rename `vercel.json`** (Vercel will auto-detect Vite)

2. **In Vercel Dashboard**:
   - Set **Root Directory** to `client`
   - Add **Environment Variable**: `VITE_API_URL`
   - That's it!

3. **Redeploy**

## Why This Happens

- Vercel tries to run the build from root directory
- But `client` folder is a subdirectory
- Solution: Tell Vercel the root directory is `client`

## Verification

After fixing:
1. Go to Deployments tab
2. Click on the latest deployment
3. Check Build Logs
4. Should see: "Building in client directory" and "Build completed"

## Still Having Issues?

Check the build logs for specific errors:
- Missing dependencies? → Check `client/package.json`
- TypeScript errors? → Check `client/src` files
- Vite config issues? → Check `client/vite.config.js`

