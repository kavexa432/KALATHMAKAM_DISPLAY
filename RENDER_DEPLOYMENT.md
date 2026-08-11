# 🚀 Deploying KALATHMAKAM Display to Render

## Prerequisites
- GitHub account
- Render account (https://render.com)
- Firebase credentials

## Step 1: Push to GitHub

Your code is already committed. Now push to the display repository:

```bash
git push display main
```

Or if you want to push to origin:
```bash
git push origin main
```

## Step 2: Create Render Account

1. Go to https://render.com
2. Sign up with your GitHub account
3. Authorize Render to access your repositories

## Step 3: Deploy Frontend (Display Website)

### 3.1 Create New Static Site

1. From Render Dashboard, click **"New +"** → **"Static Site"**
2. Connect your GitHub repository: `KALATHMAKAM_DISPLAY`
3. Configure the service:

```yaml
Name: kalathmakam-display
Branch: main
Build Command: npm run build
Publish Directory: dist
```

### 3.2 Environment Variables (Frontend)

Add these in Render Dashboard → Environment:

```
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

Get these from Firebase Console → Project Settings → General → Your apps

### 3.3 Deploy

Click **"Create Static Site"** and wait for deployment (3-5 minutes)

## Step 4: Deploy Backend API (Optional)

If you need the OCR backend:

### 4.1 Create New Web Service

1. From Render Dashboard, click **"New +"** → **"Web Service"**
2. Connect the same repository
3. Configure:

```yaml
Name: kalathmakam-api
Environment: Node
Branch: main
Build Command: cd backend && npm install
Start Command: cd backend && node server.js
```

### 4.2 Environment Variables (Backend)

```
PORT=3001
GEMINI_API_KEY=your_gemini_api_key
GEMINI_API_KEYS=your_gemini_api_keys_comma_separated
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY=your_private_key_with_newlines
```

Get Firebase service account from:
Firebase Console → Project Settings → Service Accounts → Generate New Private Key

## Step 5: Configure Custom Domain (Optional)

1. Go to your Static Site settings
2. Click **"Custom Domains"**
3. Add your domain: `display.kalathmakam.com`
4. Update DNS records as instructed by Render

## Step 6: Access Your Display

Once deployed, you'll get URLs like:

```
Frontend: https://kalathmakam-display.onrender.com
Backend: https://kalathmakam-api.onrender.com
```

### Display Page URLs:

- **Main Website**: `https://kalathmakam-display.onrender.com/`
- **🎯 Large Display Mode**: `https://kalathmakam-display.onrender.com/display`
- **Leaderboard**: `https://kalathmakam-display.onrender.com/leaderboard`

## 📺 Using the Display Mode

For your school TV/projector:

1. Open: `https://your-site.onrender.com/display`
2. Press **F11** for fullscreen mode
3. The display will auto-update with live Firebase data
4. No interaction needed - it's a broadcast display!

## 🔄 Automatic Deployments

Render automatically redeploys when you push to GitHub:

```bash
git add .
git commit -m "Update display design"
git push display main
```

Wait 3-5 minutes for Render to rebuild and deploy.

## 💡 Important Notes

### Free Tier Limitations:
- **Static Sites**: Free forever ✅
- **Web Services**: Free but spins down after 15 mins of inactivity
- First request after spin-down takes 30-60 seconds

### For Production:
- Upgrade to **Starter Plan** ($7/month) to keep backend always running
- Use custom domain for professional look
- Set up Firebase security rules for production

## 🔧 Troubleshooting

### Build Fails:
```bash
# Check if build works locally first
npm run build
```

### Display Not Showing Data:
1. Check Firebase credentials in Render environment variables
2. Verify Firebase security rules allow read access
3. Check browser console for errors

### Backend Not Working:
1. Check if service is running (not spun down)
2. Verify all environment variables are set
3. Check logs in Render Dashboard

## 📱 Testing Before Deployment

Test locally first:

```bash
# Frontend
npm run build
npm run preview

# Backend
cd backend
node server.js
```

Then open:
- Frontend: `http://localhost:4173/display`
- Backend: `http://localhost:3001`

## 🎉 You're Done!

Your KALATHMAKAM display is now live and accessible from anywhere!

Share the display URL with your school to showcase on their TVs and projectors. 📺✨

---

**Need Help?** 
- Render Docs: https://render.com/docs
- Firebase Docs: https://firebase.google.com/docs
