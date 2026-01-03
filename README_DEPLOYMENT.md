# Quick Start: Deploy to Render & Build APK

## 🚀 Deploy Backend to Render (5 minutes)

1. **Push code to GitHub**
   ```bash
   git add .
   git commit -m "Add deployment config"
   git push
   ```

2. **Create Render account** at https://render.com

3. **Create PostgreSQL database**:
   - New → PostgreSQL
   - Copy the Internal Database URL

4. **Deploy Web Service**:
   - New → Web Service
   - Connect GitHub repo
   - Settings:
     - Build: `cd server && npm install`
     - Start: `cd server && npm start`
   - Add env vars:
     - `DATABASE_URL` = your postgres URL
     - `JWT_SECRET` = random string
     - `NODE_ENV` = production

5. **Update API URL** in `src/services/AuthService.ts`:
   ```typescript
   const API_BASE_URL = 'https://your-service.onrender.com';
   ```

## 📱 Build APK via GitHub (Automatic)

1. **Push to main branch** → APK builds automatically
2. **Go to Actions tab** → Download APK from artifacts
3. **Or create a release tag**:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```
   → Creates GitHub Release with APK attached

## 📋 Files Created

- `server/` - Backend API (deploy to Render)
- `.github/workflows/build-android-apk.yml` - Auto-build APK
- `render.yaml` - Render deployment config
- `DEPLOYMENT.md` - Full deployment guide

## ⚡ Quick Commands

```bash
# Test backend locally
cd server && npm install && npm start

# Build APK locally
cd android && ./gradlew assembleRelease

# Find APK
android/app/build/outputs/apk/release/app-release.apk
```

See `DEPLOYMENT.md` for detailed instructions!

