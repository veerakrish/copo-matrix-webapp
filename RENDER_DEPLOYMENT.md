# Render Deployment Guide - Step by Step

## Important Notes

⚠️ **The backend runs from the ROOT directory, not the server folder!**

- Root `package.json` has: `"start": "node server/index.js"`
- This is what Render will use
- You don't need to be in the server folder

## Backend Deployment on Render

### Step 1: Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Authorize Render to access your repositories

### Step 2: Deploy Backend (Web Service)

1. Click **"New +"** → **"Web Service"**

2. **Connect Repository**:
   - Select your GitHub repository (`copo-matrix-webapp`)
   - Or paste: `https://github.com/YOUR_USERNAME/copo-matrix-webapp`

3. **Configure Service**:
   - **Name**: `copo-matrix-backend`
   - **Environment**: `Node`
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Root Directory**: **Leave EMPTY** (this is important - it should be root `/`)
   - **Runtime**: `Node` (auto-detected)
   - **Build Command**: `npm install`
   - **Start Command**: `npm start` (or `npm run server` - both work)

4. **Environment Variables** (Click "Advanced"):
   Add these variables:
   ```
   MISTRALAI_API_KEY = your_mistral_api_key_here
   NODE_ENV = production
   PORT = 5001
   ```
   (Note: PORT can be left empty - Render will auto-assign)

5. **Click "Create Web Service"**

6. **Wait for Deployment** (5-10 minutes)
   - First deployment takes longer
   - Watch the logs for any errors

7. **Copy Your Backend URL**
   - It will be: `https://copo-matrix-backend.onrender.com`
   - Test it: `https://copo-matrix-backend.onrender.com/api/po-data`
   - Should return JSON data

## Frontend Deployment on Render

### Option A: Static Site (Recommended)

1. Click **"New +"** → **"Static Site"**

2. **Connect Repository**:
   - Select your GitHub repository

3. **Configure**:
   - **Name**: `copo-matrix-frontend`
   - **Branch**: `main`
   - **Root Directory**: **Leave EMPTY**
   - **Build Command**: `cd client && npm install && npm run build`
   - **Publish Directory**: `client/dist`

4. **Environment Variables**:
   ```
   VITE_API_URL = https://copo-matrix-backend.onrender.com
   ```
   (Replace with your actual backend URL)

5. **Click "Create Static Site"**

6. **Wait for Deployment** (2-5 minutes)

7. **Your Frontend URL**: `https://copo-matrix-frontend.onrender.com`

### Option B: Web Service (Alternative)

If Static Site doesn't work, use Web Service:

1. Click **"New +"** → **"Web Service"**

2. **Configure**:
   - **Name**: `copo-matrix-frontend`
   - **Environment**: `Node`
   - **Root Directory**: **Leave EMPTY**
   - **Build Command**: `cd client && npm install && npm run build`
   - **Start Command**: `cd client && npx serve -s dist -l 3000`
   - **Add Buildpack**: `static` (or use Node)

3. **Environment Variables**:
   ```
   VITE_API_URL = https://copo-matrix-backend.onrender.com
   ```

## Troubleshooting

### Error: "vite not found"

**Problem**: Render is trying to build from root, but vite is in `client/` folder.

**Solution**: 
- Make sure **Root Directory** is **EMPTY** (not `client`)
- Use build command: `cd client && npm install && npm run build`
- Publish directory: `client/dist`

### Error: "npm run server not found"

**Problem**: You're trying to run from server folder, but scripts are in root.

**Solution**:
- Run from **root directory**: `npm start` or `npm run server`
- Both commands work: `"start": "node server/index.js"` and `"server": "node server/index.js"`

### Backend Not Starting

**Check**:
1. Root directory is empty (not `server`)
2. Start command is `npm start` or `npm run server`
3. PORT environment variable is set (or leave empty for auto-assign)
4. All dependencies are in root `package.json`

### CORS Errors

**Solution**: 
1. In Render backend, add environment variable:
   ```
   FRONTEND_URL = https://copo-matrix-frontend.onrender.com
   ```
2. Or update `server/index.js` to allow all origins in production:
   ```javascript
   app.use(cors({
     origin: process.env.FRONTEND_URL || '*',
     credentials: true
   }));
   ```

### Service Sleeping

**Problem**: Render free tier services sleep after 15 min inactivity.

**Solution**: 
- First request after sleep takes 30-60 seconds
- This is normal for free tier
- Consider upgrading to paid plan for always-on service

## Verification Checklist

- [ ] Backend URL returns JSON at `/api/po-data`
- [ ] Frontend loads without errors
- [ ] Frontend can connect to backend (check browser console)
- [ ] Matrix generation works
- [ ] DOCX download works
- [ ] No CORS errors in browser console

## Quick Reference

### Backend (Render Web Service)
- **Root Directory**: Empty (root `/`)
- **Build**: `npm install`
- **Start**: `npm start`
- **Port**: Auto-assigned (or set PORT env var)

### Frontend (Render Static Site)
- **Root Directory**: Empty (root `/`)
- **Build**: `cd client && npm install && npm run build`
- **Publish**: `client/dist`
- **Env Var**: `VITE_API_URL` = your backend URL

## Updating After Changes

1. Push to GitHub:
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```

2. Render will auto-deploy (watch the dashboard)

3. Wait for deployment to complete

4. Test your changes

---

**Remember**: Always run from ROOT directory, not server folder!

