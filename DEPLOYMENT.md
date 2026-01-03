# APSAR Emergency App - Deployment Guide

## Overview

This guide covers deploying the APSAR Emergency App backend to Render and building Android APKs through GitHub Actions.

---

## Part 1: Deploy Backend API to Render

### Prerequisites
- GitHub account
- Render account (sign up at https://render.com)
- PostgreSQL database (Render provides this)

### Step 1: Prepare Repository

1. Ensure all files are committed and pushed to GitHub:
   ```bash
   git add .
   git commit -m "Add deployment configuration"
   git push origin main
   ```

### Step 2: Create PostgreSQL Database on Render

1. Log in to Render dashboard
2. Click "New +" → "PostgreSQL"
3. Configure:
   - **Name**: `apsar-db`
   - **Database**: `apsar_db`
   - **User**: Auto-generated
   - **Region**: Choose closest to your users
   - **Plan**: Free tier for testing, upgrade for production
4. Click "Create Database"
5. Copy the **Internal Database URL** (you'll need this)

### Step 3: Deploy Web Service

1. In Render dashboard, click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure service:
   - **Name**: `apsar-api`
   - **Environment**: `Node`
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && npm start`
   - **Plan**: Free tier for testing

4. Add Environment Variables:
   ```
   NODE_ENV=production
   PORT=3000
   DATABASE_URL=<your-postgres-internal-url>
   JWT_SECRET=<generate-a-random-secret>
   ALLOWED_ORIGINS=https://your-app.onrender.com
   ```

5. Click "Create Web Service"

### Step 4: Update API Base URL

Update your mobile app's API base URL:

1. In Render, copy your service URL (e.g., `https://apsar-api.onrender.com`)
2. Update `src/services/AuthService.ts`:
   ```typescript
   const API_BASE_URL = process.env.API_BASE_URL || 'https://apsar-api.onrender.com';
   ```
3. Update `src/services/ApiService.ts` similarly

### Step 5: Verify Deployment

1. Visit `https://your-service.onrender.com/health`
2. Should return: `{"status":"ok","timestamp":"...","uptime":...}`

---

## Part 2: Build Android APK via GitHub Actions

### Prerequisites
- GitHub repository
- Android SDK (handled by GitHub Actions)

### Step 1: Configure GitHub Secrets (Optional)

For production builds, you may want to add:
- `ANDROID_KEYSTORE` - Base64 encoded keystore file
- `ANDROID_KEYSTORE_PASSWORD` - Keystore password
- `ANDROID_KEY_ALIAS` - Key alias
- `ANDROID_KEY_PASSWORD` - Key password

### Step 2: Trigger Build

The workflow automatically runs on:
- Push to `main` or `develop` branches
- Pull requests to `main`
- Manual trigger (workflow_dispatch)
- Tags starting with `v` (creates GitHub release)

### Step 3: Download APK

1. Go to your GitHub repository
2. Click "Actions" tab
3. Select the latest workflow run
4. Download the APK from "Artifacts" section

### Step 4: Create Release (Optional)

1. Create a git tag:
   ```bash
   git tag -a v1.0.0 -m "Release version 1.0.0"
   git push origin v1.0.0
   ```

2. GitHub Actions will automatically:
   - Build the APK
   - Create a GitHub Release
   - Attach the APK to the release

---

## Part 3: Production Setup

### Database Setup

1. **Run Migrations**:
   - Create migration files based on `docs/DATABASE_SCHEMA.md`
   - Use a migration tool like `node-pg-migrate` or `knex`

2. **Seed Initial Data**:
   - Create seed scripts for initial users, vehicles, etc.

### Security

1. **Generate Strong Secrets**:
   ```bash
   # Generate JWT secret
   openssl rand -base64 32
   ```

2. **Update Environment Variables**:
   - Set strong `JWT_SECRET`
   - Configure `ALLOWED_ORIGINS` properly
   - Add database credentials

3. **Enable HTTPS**:
   - Render provides HTTPS automatically
   - Update API URLs to use HTTPS

### Monitoring

1. **Set up Logging**:
   - Render provides logs in dashboard
   - Consider adding external logging (e.g., Logtail, Datadog)

2. **Set up Alerts**:
   - Configure health check alerts in Render
   - Set up uptime monitoring

---

## Part 4: Local Development

### Backend

1. **Install Dependencies**:
   ```bash
   cd server
   npm install
   ```

2. **Set up Environment**:
   ```bash
   cp server/.env.example server/.env
   # Edit server/.env with your values
   ```

3. **Run Server**:
   ```bash
   cd server
   npm run dev  # Uses nodemon for auto-reload
   ```

### Mobile App

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Set up Environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your API URL
   ```

3. **Run App**:
   ```bash
   # Android
   npm run android

   # iOS
   npm run ios
   ```

---

## Troubleshooting

### Render Deployment Issues

**Problem**: Build fails
- **Solution**: Check build logs in Render dashboard
- Ensure `server/package.json` exists and is valid

**Problem**: Service won't start
- **Solution**: Check start command is correct
- Verify `PORT` environment variable is set
- Check application logs

**Problem**: Database connection fails
- **Solution**: Verify `DATABASE_URL` is correct
- Check database is running
- Ensure database allows connections from Render

### GitHub Actions Issues

**Problem**: Build fails with Gradle errors
- **Solution**: Check Android SDK version compatibility
- Verify `android/build.gradle` configuration

**Problem**: APK not generated
- **Solution**: Check build logs for errors
- Verify Gradle build completes successfully

**Problem**: APK too large
- **Solution**: Enable ProGuard/R8 minification
- Remove unused dependencies
- Use App Bundle (AAB) instead of APK

---

## Next Steps

1. **Implement Database**:
   - Set up PostgreSQL schema
   - Implement all API endpoints
   - Add authentication middleware

2. **Add File Storage**:
   - Set up AWS S3 or similar
   - Implement file upload endpoints
   - Configure CORS for file access

3. **Add Authentication**:
   - Implement JWT token generation
   - Add refresh token logic
   - Set up password hashing

4. **Add Real Features**:
   - Implement all API endpoints from `docs/API_ENDPOINTS.md`
   - Add database queries
   - Add validation and error handling

5. **Testing**:
   - Set up CI/CD tests
   - Add integration tests
   - Test on real devices

---

## Resources

- [Render Documentation](https://render.com/docs)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [React Native Android Build](https://reactnative.dev/docs/signed-apk-android)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

**Need Help?** Check the logs in Render dashboard or GitHub Actions for detailed error messages.

