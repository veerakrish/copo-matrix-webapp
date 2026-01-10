# GitHub Setup & Deployment Guide

## Step 1: Initialize Git Repository

```bash
# Navigate to your project directory
cd copo_new_webapp

# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: CO-PO-PSO Matrix Web Application"
```

## Step 2: Create GitHub Repository

1. Go to [GitHub.com](https://github.com) and sign in
2. Click the **"+"** icon in the top right → **"New repository"**
3. Fill in:
   - **Repository name**: `copo-matrix-webapp` (or your preferred name)
   - **Description**: "CO-PO-PSO Matrix Web Application for CSE Program"
   - **Visibility**: Public (for free hosting) or Private
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
4. Click **"Create repository"**

## Step 3: Push to GitHub

```bash
# Add remote repository (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/copo-matrix-webapp.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

## Step 4: Deploy Backend to Render (Free)

### 4.1 Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with your GitHub account
3. Authorize Render to access your repositories

### 4.2 Deploy Backend Service
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository (`copo-matrix-webapp`)
3. Configure the service:
   - **Name**: `copo-matrix-backend`
   - **Environment**: `Node`
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Root Directory**: Leave empty (root)
   - **Build Command**: `npm install`
   - **Start Command**: `npm run server`
4. Click **"Advanced"** and add Environment Variables:
   - **Key**: `MISTRALAI_API_KEY`
   - **Value**: Your Mistral API key (get from https://console.mistral.ai/)
   - **Key**: `NODE_ENV`
   - **Value**: `production`
   - **Key**: `PORT`
   - **Value**: `5001` (or leave empty, Render will assign)
5. Click **"Create Web Service"**
6. Wait for deployment (5-10 minutes)
7. **Copy the service URL** (e.g., `https://copo-matrix-backend.onrender.com`)

### 4.3 Update CORS (if needed)
The backend should already handle CORS, but if you have issues, you can add:
- **Key**: `FRONTEND_URL`
- **Value**: Your frontend URL (we'll set this after deploying frontend)

## Step 5: Deploy Frontend to Vercel (Free)

### 5.1 Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up with your GitHub account
3. Authorize Vercel to access your repositories

### 5.2 Deploy Frontend
1. Click **"Add New..."** → **"Project"**
2. Import your GitHub repository (`copo-matrix-webapp`)
3. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
4. Click **"Environment Variables"** and add:
   - **Key**: `VITE_API_URL`
   - **Value**: Your Render backend URL (e.g., `https://copo-matrix-backend.onrender.com`)
5. Click **"Deploy"**
6. Wait for deployment (2-5 minutes)
7. **Copy your frontend URL** (e.g., `https://copo-matrix-webapp.vercel.app`)

### 5.3 Update Backend CORS
Go back to Render and update the `FRONTEND_URL` environment variable:
- **Key**: `FRONTEND_URL`
- **Value**: Your Vercel frontend URL

## Step 6: Alternative - Deploy Both to Render

If you prefer to use Render for both:

### Frontend on Render (Static Site)
1. In Render dashboard, click **"New +"** → **"Static Site"**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `copo-matrix-frontend`
   - **Build Command**: `cd client && npm install && npm run build`
   - **Publish Directory**: `client/dist`
4. Add Environment Variable:
   - **Key**: `VITE_API_URL`
   - **Value**: Your Render backend URL
5. Click **"Create Static Site"**

## Step 7: Verify Deployment

1. **Test Backend**:
   - Visit: `https://your-backend-url.onrender.com/api/po-data`
   - Should return JSON data

2. **Test Frontend**:
   - Visit your frontend URL
   - Should load the application
   - Try generating a matrix

3. **Test DOCX Download**:
   - Generate a matrix
   - Click "Download as DOCX"
   - Should download the file

## Troubleshooting

### Backend Issues

**Problem**: Backend shows "Service Unavailable"
- **Solution**: Render free tier services sleep after 15 min inactivity. First request may take 30-60 seconds to wake up.

**Problem**: CORS errors
- **Solution**: Ensure `FRONTEND_URL` environment variable is set in Render

**Problem**: API key not working
- **Solution**: Double-check `MISTRALAI_API_KEY` in Render environment variables (no quotes needed)

### Frontend Issues

**Problem**: Frontend can't connect to backend
- **Solution**: Verify `VITE_API_URL` is set correctly in Vercel/Render environment variables

**Problem**: Build fails
- **Solution**: Check build logs, ensure all dependencies are in `package.json`

**Problem**: 404 errors
- **Solution**: Ensure `vite.config.js` is configured correctly for production

## Updating Your Deployment

After making changes:

```bash
# Make your changes
git add .
git commit -m "Your commit message"
git push origin main
```

Both Render and Vercel will automatically redeploy on push to `main` branch.

## Free Tier Limitations

### Render
- ✅ 750 hours/month free
- ⚠️ Services sleep after 15 min inactivity (first request may be slow)
- ✅ Auto-deploy from GitHub
- ✅ Custom domains supported

### Vercel
- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ Auto-deploy from GitHub
- ✅ Custom domains supported
- ✅ No sleep/wake time

## Custom Domain (Optional)

### Render (Backend)
1. Go to your service → **Settings** → **Custom Domain**
2. Add your domain
3. Follow DNS configuration instructions

### Vercel (Frontend)
1. Go to your project → **Settings** → **Domains**
2. Add your domain
3. Follow DNS configuration instructions

## Security Notes

⚠️ **Important**: Never commit `.env` file to GitHub
- ✅ `.env` is already in `.gitignore`
- ✅ Use environment variables in hosting platforms
- ✅ Keep your `MISTRALAI_API_KEY` secret

## Support

If you encounter issues:
1. Check deployment logs in Render/Vercel dashboard
2. Check browser console for errors
3. Verify all environment variables are set
4. Ensure backend is awake (make a test request)

---

**Congratulations!** 🎉 Your application is now live and accessible worldwide!

