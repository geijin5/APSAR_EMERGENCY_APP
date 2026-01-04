# Render Deployment Setup Instructions

## Problem
Render is trying to run `node index.js` from the root directory, but the server is in the `server/` directory.

## Solution: Update Render Dashboard Settings

1. **Go to your Render Dashboard**: https://dashboard.render.com

2. **Select your Web Service** (e.g., `apsar-api`)

3. **Go to Settings** tab

4. **Update these settings**:

   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

5. **Environment Variables** (add these in the Environment tab):
   ```
   NODE_ENV=production
   PORT=3000
   DATABASE_URL=<your-postgres-database-url>
   JWT_SECRET=<generate-a-random-secret>
   ALLOWED_ORIGINS=https://your-app.onrender.com
   ```

6. **Save Changes** and **Manual Deploy** to test

## Alternative: Use render.yaml (Infrastructure as Code)

If you want Render to use the `render.yaml` file:

1. In Render Dashboard, go to your service
2. Settings → **Infrastructure as Code**
3. Enable **Infrastructure as Code**
4. Connect your GitHub repository
5. Render will automatically use `render.yaml` from your repo

## Quick Fix for Current Error

The current error shows Render is looking for `/opt/render/project/src/index.js`

This means:
- **Root Directory** is set incorrectly (should be `server`, not root)
- **Start Command** is set to `node index.js` (should be `npm start`)

Fix in Render Dashboard:
- Change **Root Directory** to: `server`
- Change **Start Command** to: `npm start`

Then click **Manual Deploy** to redeploy with the correct settings.

