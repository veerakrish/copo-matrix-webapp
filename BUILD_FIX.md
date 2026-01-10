# Build Failed - Fix Guide

## Common Build Errors and Solutions

### Error 1: "Static site doesn't support npm"

**Problem**: Render's static site type doesn't run npm commands.

**Solution**: Use **Web Service** instead of Static Site for frontend.

### Error 2: "vite not found"

**Problem**: Build command not finding vite.

**Solution**: Make sure you're in the client directory:
```bash
cd client && npm install && npm run build
```

### Error 3: "Cannot find module"

**Problem**: Dependencies not installed.

**Solution**: Always run `npm install` before build.

## Recommended Render Configuration

### Backend (Web Service)
- **Type**: Web Service
- **Environment**: Node
- **Root Directory**: Empty (root `/`)
- **Build Command**: `npm install`
- **Start Command**: `npm start`

### Frontend (Web Service - NOT Static Site)
- **Type**: Web Service (not Static Site)
- **Environment**: Node
- **Root Directory**: Empty (root `/`)
- **Build Command**: `cd client && npm install && npm run build`
- **Start Command**: `npx serve -s client/dist -l 3000`
- **Environment Variable**: `VITE_API_URL` = your backend URL

## Manual Setup in Render Dashboard

### For Backend:
1. Go to Render Dashboard
2. Click "New +" → "Web Service"
3. Connect your GitHub repo
4. Settings:
   - Name: `copo-matrix-backend`
   - Environment: `Node`
   - Root Directory: **EMPTY**
   - Build Command: `npm install`
   - Start Command: `npm start`
5. Add Environment Variables:
   - `MISTRALAI_API_KEY` = your key
   - `NODE_ENV` = `production`
   - `PORT` = `5001` (or leave empty)

### For Frontend:
1. Go to Render Dashboard
2. Click "New +" → "Web Service" (NOT Static Site)
3. Connect your GitHub repo
4. Settings:
   - Name: `copo-matrix-frontend`
   - Environment: `Node`
   - Root Directory: **EMPTY**
   - Build Command: `cd client && npm install && npm run build`
   - Start Command: `npx serve -s client/dist -l 3000`
5. Add Environment Variable:
   - `VITE_API_URL` = `https://copo-matrix-backend.onrender.com` (your backend URL)

## Alternative: Use Vercel for Frontend

If Render keeps failing, use Vercel for frontend:

1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repo
3. Settings:
   - Framework: Vite
   - Root Directory: `client`
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Add Environment Variable:
   - `VITE_API_URL` = your Render backend URL

## Check Build Logs

1. Go to your service in Render
2. Click "Logs" tab
3. Look for the specific error message
4. Common errors:
   - "command not found" → Check build command syntax
   - "module not found" → Dependencies not installed
   - "permission denied" → Check file permissions
   - "ENOENT" → File/directory doesn't exist

## Quick Test Locally

Test if build works locally:

```bash
# Test backend
npm install
npm start

# Test frontend build
cd client
npm install
npm run build
```

If it works locally but fails on Render, it's a configuration issue.

