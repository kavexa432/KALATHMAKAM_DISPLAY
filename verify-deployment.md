# ✅ Pre-Deployment Checklist

Before deploying to Render, verify these items:

## 1. Firebase Configuration

Check if your `.env` file has all Firebase credentials:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

## 2. Build Test

Run build locally to ensure no errors:

```bash
npm run build
```

Expected output:
```
✓ built in 15s
```

## 3. Preview Test

Test the production build:

```bash
npm run preview
```

Then visit:
- http://localhost:4173/
- http://localhost:4173/display ← **Test this one!**
- http://localhost:4173/leaderboard

## 4. Git Status

Check if all changes are committed:

```bash
git status
```

Should show:
```
On branch main
nothing to commit, working tree clean
```

## 5. Push to GitHub

Push your code:

```bash
# If using the display remote
git push display main

# OR if using origin
git push origin main
```

## 6. Firebase Security Rules

Make sure your Firestore rules allow public read access for the display:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to results for display
    match /results/{resultId} {
      allow read: if true;
    }
    
    // Allow read access to houses
    match /houses/{houseId} {
      allow read: if true;
    }
  }
}
```

## ✅ Ready to Deploy!

If all checks pass, you're ready to deploy on Render!

Follow the steps in `RENDER_DEPLOYMENT.md`

## 🎯 Quick Deploy Steps:

1. Go to https://render.com
2. Click "New +" → "Static Site"
3. Connect GitHub repo: `KALATHMAKAM_DISPLAY`
4. Set:
   - Build Command: `npm run build`
   - Publish Directory: `dist`
5. Add Firebase environment variables
6. Click "Create Static Site"
7. Wait 3-5 minutes ⏰
8. Visit: `https://your-site.onrender.com/display` 🎉

---

**Pro Tip:** The display page is at `/display` route, not the homepage!
