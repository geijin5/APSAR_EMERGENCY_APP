# Render Deployment Fix

## The Problem
Render is looking for `/opt/render/project/src/index.js` but your server is at `server/index.js`

## Solution: Update Render Dashboard

**You MUST configure this in the Render Dashboard manually:**

1. Go to https://dashboard.render.com
2. Select your **Web Service** (apsar-api)
3. Click **Settings** tab
4. Scroll to **Build & Deploy** section
5. Update these EXACT settings:

   ```
   Root Directory: server
   ```
   
   ```
   Build Command: npm install
   ```
   
   ```
   Start Command: npm start
   ```
   
   (Leave Start Command as `npm start` - don't use `node index.js`)

6. Scroll down and click **Save Changes**
7. Go to **Manual Deploy** tab
8. Click **Deploy latest commit**

## Alternative: Delete and Recreate Service

If the above doesn't work:

1. Delete the current service in Render
2. Create a **New Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Name**: apsar-api
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Node
5. Add environment variables:
   - NODE_ENV=production
   - PORT=3000
   - DATABASE_URL=(your postgres URL)
   - JWT_SECRET=(random secret)
6. Click **Create Web Service**

## Verify It Works

After deployment, visit:
```
https://your-service-name.onrender.com/health
```

Should return:
```json
{"status":"ok","timestamp":"...","uptime":...}
```

