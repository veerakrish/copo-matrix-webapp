# Deployment Guide

This guide will help you deploy the CO-PO Matrix Web Application to free hosting platforms.

## Architecture

The application consists of:
- **Frontend**: React app (can be deployed to Vercel or Netlify)
- **Backend**: Node.js/Express API (can be deployed to Render or Railway)

## Option 1: Deploy to Render (Recommended - Full Stack)

Render offers free hosting for both frontend and backend.

### Backend Deployment (Render)

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/copo-matrix-webapp.git
   git push -u origin main
   ```

2. **Create Render Account**:
   - Go to [render.com](https://render.com)
   - Sign up with GitHub

3. **Deploy Backend**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name**: `copo-matrix-backend`
     - **Environment**: `Node`
     - **Build Command**: `npm install`
     - **Start Command**: `npm run server`
     - **Root Directory**: Leave empty (root)
   - Add Environment Variable:
     - `MISTRALAI_API_KEY`: Your Mistral API key
   - Click "Create Web Service"
   - Note the URL (e.g., `https://copo-matrix-backend.onrender.com`)

4. **Update Frontend**:
   - Update `client/vite.config.js` proxy target to your Render backend URL
   - Or use environment variables for API URL

### Frontend Deployment (Render)

1. **Create Static Site**:
   - Click "New +" → "Static Site"
   - Connect your GitHub repository
   - Configure:
     - **Name**: `copo-matrix-frontend`
     - **Build Command**: `cd client && npm install && npm run build`
     - **Publish Directory**: `client/dist`
   - Add Environment Variable:
     - `VITE_API_URL`: Your backend URL (e.g., `https://copo-matrix-backend.onrender.com`)
   - Click "Create Static Site"

2. **Update API Calls**:
   - Update frontend to use `import.meta.env.VITE_API_URL` for API calls

## Option 2: Deploy to Vercel (Frontend) + Render (Backend)

### Backend (Render)
Follow steps 1-3 from Option 1.

### Frontend (Vercel)

1. **Install Vercel CLI** (optional):
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub
   - Click "New Project"
   - Import your GitHub repository
   - Configure:
     - **Framework Preset**: Vite
     - **Root Directory**: `client`
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`
   - Add Environment Variable:
     - `VITE_API_URL`: Your Render backend URL
   - Click "Deploy"

## Option 3: Deploy to Netlify (Frontend) + Railway (Backend)

### Backend (Railway)

1. **Create Railway Account**:
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Deploy**:
   - Click "New Project" → "Deploy from GitHub"
   - Select your repository
   - Railway will auto-detect Node.js
   - Add Environment Variable:
     - `MISTRALAI_API_KEY`: Your Mistral API key
   - Note the generated URL

### Frontend (Netlify)

1. **Deploy**:
   - Go to [netlify.com](https://netlify.com)
   - Sign up with GitHub
   - Click "Add new site" → "Import an existing project"
   - Connect your GitHub repository
   - Configure:
     - **Base directory**: `client`
     - **Build command**: `npm run build`
     - **Publish directory**: `client/dist`
   - Add Environment Variable:
     - `VITE_API_URL`: Your Railway backend URL
   - Click "Deploy site"

## Updating Frontend for Production

You need to update the frontend to use environment variables for the API URL:

1. **Update `client/vite.config.js`**:
   ```javascript
   export default defineConfig({
     plugins: [react()],
     server: {
       port: 3000,
       proxy: {
         '/api': {
           target: import.meta.env.VITE_API_URL || 'http://localhost:5001',
           changeOrigin: true
         }
       }
     }
   })
   ```

2. **Update API calls in `client/src/App.jsx`**:
   ```javascript
   const API_URL = import.meta.env.VITE_API_URL || '';
   fetch(`${API_URL}/api/po-data`)
   ```

## Environment Variables

### Backend (.env)
```
MISTRALAI_API_KEY=your_api_key_here
PORT=5001
```

### Frontend (.env)
```
VITE_API_URL=https://your-backend-url.onrender.com
```

## Post-Deployment Checklist

- [ ] Backend is accessible at the deployed URL
- [ ] Frontend can connect to backend API
- [ ] Environment variables are set correctly
- [ ] CORS is configured properly
- [ ] File uploads work (if using)
- [ ] DOCX download works

## Troubleshooting

### CORS Issues
If you see CORS errors, ensure your backend has:
```javascript
app.use(cors());
```

### API Not Found
- Check that your frontend environment variable `VITE_API_URL` is set correctly
- Verify the backend URL is accessible
- Check browser console for errors

### Build Failures
- Ensure all dependencies are in `package.json`
- Check build logs for specific errors
- Verify Node.js version compatibility

## Free Tier Limitations

- **Render**: 750 hours/month free, sleeps after 15 min inactivity
- **Vercel**: Unlimited for personal projects
- **Netlify**: 100GB bandwidth/month
- **Railway**: $5 free credit/month

## Custom Domain

All platforms support custom domains:
- Render: Settings → Custom Domain
- Vercel: Project Settings → Domains
- Netlify: Domain Settings → Custom Domain

