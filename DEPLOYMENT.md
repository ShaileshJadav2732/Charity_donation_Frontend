# Deployment Guide for Charity Donation Frontend

## Overview
This guide will help you deploy the Charity Donation Frontend application to various platforms.

## Fixed Issues

### 1. **Google Fonts Issue**
- **Problem**: Build was failing due to inability to fetch Google Fonts (Inter) during build time
- **Solution**: Removed the `next/font/google` import and used Inter font via CSS instead

### 2. **Missing Environment Variables**
- **Problem**: Firebase configuration required environment variables that were missing
- **Solution**:
  - Created `.env.local.example` with all required environment variables
  - Added fallback values in Firebase configuration
  - Updated README with environment setup instructions

### 3. **Missing Dependencies**
- **Problem**: ESLint and ESLint config were missing
- **Solution**: Installed `eslint` and `eslint-config-next` as dev dependencies

### 4. **Build Configuration**
- **Problem**: Next.js was trying to statically generate all pages without proper env vars
- **Solution**: Added `output: 'standalone'` to `next.config.ts` for better deployment compatibility

## Deployment Steps

### Prerequisites
Before deploying, ensure you have:
1. A Firebase project set up with Authentication enabled
2. A backend API running (or update `NEXT_PUBLIC_API_URL` to point to your backend)
3. (Optional) Cloudinary account for image uploads
4. (Optional) Stripe account for payment processing

### Option 1: Deploy to Vercel (Recommended)

1. **Push your code to GitHub** (already done if using this branch)

2. **Import to Vercel**
   - Go to [Vercel](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js configuration

3. **Configure Environment Variables**
   Add the following environment variables in Vercel's project settings:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_actual_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
   NEXT_PUBLIC_API_URL=https://your-backend-api.com/api
   ```

4. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy your application

### Option 2: Deploy to Netlify

1. **Install Netlify CLI** (optional)
   ```bash
   npm install -g netlify-cli
   ```

2. **Connect to Netlify**
   - Go to [Netlify](https://netlify.com)
   - Click "New site from Git"
   - Connect your GitHub repository

3. **Build Settings**
   - Build command: `npm run build`
   - Publish directory: `.next`

4. **Environment Variables**
   Add the same environment variables as listed in the Vercel section

5. **Deploy**
   - Click "Deploy site"

### Option 3: Deploy to Railway

1. **Create Railway Project**
   - Go to [Railway](https://railway.app)
   - Click "New Project"
   - Select "Deploy from GitHub repo"

2. **Configure Build**
   - Railway will auto-detect Next.js
   - Build command: `npm run build`
   - Start command: `npm start`

3. **Environment Variables**
   Add the environment variables in Railway's dashboard

4. **Deploy**
   - Railway will automatically deploy your application

### Option 4: Docker Deployment

1. **Create Dockerfile** (if not exists)
   ```dockerfile
   FROM node:18-alpine AS base

   # Install dependencies only when needed
   FROM base AS deps
   RUN apk add --no-cache libc6-compat
   WORKDIR /app
   COPY package.json package-lock.json ./
   RUN npm ci

   # Rebuild the source code only when needed
   FROM base AS builder
   WORKDIR /app
   COPY --from=deps /app/node_modules ./node_modules
   COPY . .
   RUN npm run build

   # Production image, copy all the files and run next
   FROM base AS runner
   WORKDIR /app
   ENV NODE_ENV production
   RUN addgroup --system --gid 1001 nodejs
   RUN adduser --system --uid 1001 nextjs
   COPY --from=builder /app/public ./public
   COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
   COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
   USER nextjs
   EXPOSE 3000
   ENV PORT 3000
   CMD ["node", "server.js"]
   ```

2. **Build and Run**
   ```bash
   docker build -t charity-frontend .
   docker run -p 3000:3000 --env-file .env.local charity-frontend
   ```

## Environment Variables Checklist

Before deploying, make sure you have set all required environment variables:

- [ ] `NEXT_PUBLIC_FIREBASE_API_KEY`
- [ ] `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- [ ] `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- [ ] `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- [ ] `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- [ ] `NEXT_PUBLIC_FIREBASE_APP_ID`
- [ ] `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`
- [ ] `NEXT_PUBLIC_API_URL` (your backend API URL)

Optional (if using):
- [ ] `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
- [ ] `NEXT_PUBLIC_CLOUDINARY_API_KEY`
- [ ] `NEXT_PUBLIC_CLOUDINARY_API_SECRET`
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

## Post-Deployment

After deploying:
1. Test authentication flow (login/signup)
2. Verify API connectivity with your backend
3. Test image uploads (if using Cloudinary)
4. Test payment flow (if using Stripe)
5. Check all routes and pages load correctly

## Troubleshooting

### Build Fails with "Firebase: Error (auth/invalid-api-key)"
- Make sure you've set valid Firebase environment variables
- The dummy values in `.env.local.example` won't work in production

### API Calls Failing
- Verify `NEXT_PUBLIC_API_URL` points to your running backend
- Check CORS settings on your backend allow requests from your frontend domain

### Images Not Loading
- Check Cloudinary configuration
- Verify image domains are allowed in `next.config.ts`

### Deployment Platform Issues
- Check build logs for specific errors
- Ensure all environment variables are set correctly
- Verify Node.js version compatibility (v18 or higher recommended)

## Support
For issues or questions, please check:
- [Next.js Deployment Documentation](https://nextjs.org/docs/app/building-your-application/deploying)
- [Vercel Documentation](https://vercel.com/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
