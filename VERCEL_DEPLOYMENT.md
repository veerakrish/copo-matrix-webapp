# Vercel Frontend Deployment Guide

## Quick Setup

1. **Go to [vercel.com](https://vercel.com)**
2. **Sign up/Login** with GitHub
3. **Click "Add New..." → "Project"**
4. **Import your GitHub repository**

## Configuration

Vercel will auto-detect Vite, but you can manually configure:

### Settings:
- **Framework Preset**: `Vite` (auto-detected)
- **Root Directory**: `client`
- **Build Command**: `npm run build` (auto-detected)
- **Output Directory**: `dist` (auto-detected)
- **Install Command**: `npm install` (auto-detected)

### Environment Variables:
Add this in Vercel dashboard:
- **Key**: `VITE_API_URL`
- **Value**: Your Render backend URL (e.g., `https://copo-matrix-backend.onrender.com`)

## Important Notes

⚠️ **Don't use `vercel.json` with routes and rewrites together!**

The `vercel.json` file has been simplified to only use `rewrites`. This is the correct format for Vite apps.

## API Proxy

The `vercel.json` includes a rewrite rule to proxy `/api/*` requests to your backend. Make sure to update the backend URL in `vercel.json`:

```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://YOUR-BACKEND-URL.onrender.com/api/$1"
    }
  ]
}
```

## Alternative: Use Environment Variable in Frontend

Instead of using rewrites, you can update the frontend to use the environment variable directly (which is already done in `App.jsx`):

1. Set `VITE_API_URL` in Vercel environment variables
2. The frontend will automatically use it
3. No need for API rewrites

## Deployment Steps

1. **Push your code to GitHub** (if not already)
2. **Import project in Vercel**
3. **Set environment variable**: `VITE_API_URL` = your backend URL
4. **Click "Deploy"**
5. **Wait 2-3 minutes**
6. **Done!** Your app will be live

## Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

## Troubleshooting

### Error: "routes cannot be present with rewrites"
- **Solution**: Use only `rewrites`, not `routes` (already fixed in vercel.json)

### API calls failing
- **Check**: `VITE_API_URL` environment variable is set correctly
- **Check**: Backend URL is accessible
- **Check**: CORS is configured in backend

### Build fails
- **Check**: Root directory is set to `client`
- **Check**: Build command is `npm run build`
- **Check**: Output directory is `dist`

### 404 errors on refresh
- **Solution**: The `rewrites` rule should handle this (already configured)

---

**That's it!** Vercel is the easiest way to deploy Vite/React apps. 🚀

