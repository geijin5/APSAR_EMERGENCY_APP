# APSAR API Server

Backend API server for APSAR Emergency App, deployable on Render.com

## Quick Start

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. Run server:
   ```bash
   npm start        # Production
   npm run dev      # Development (with nodemon)
   ```

## Deployment to Render

1. Push code to GitHub
2. Connect repository to Render
3. Use these settings:
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && npm start`
4. Add environment variables from `.env.example`

## API Endpoints

See `../docs/API_ENDPOINTS.md` for complete API documentation.

Current routes are placeholder implementations. Implement actual database queries and business logic based on the schema in `../docs/DATABASE_SCHEMA.md`.

## Next Steps

1. Set up PostgreSQL database
2. Implement database models/queries
3. Add authentication middleware
4. Implement all API endpoints
5. Add file upload handling
6. Add email/SMS services

