# Deployment Guide

This guide will help you deploy the Flash UI application to Netlify or Vercel.

## Prerequisites

Before deploying, make sure you have:
1. A Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Your code pushed to a GitHub repository

## Deploy to Netlify

### Option 1: Using Netlify UI

1. Go to [Netlify](https://app.netlify.com/)
2. Click "Add new site" → "Import an existing project"
3. Connect your GitHub account and select this repository
4. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Node version**: 22 (set in Environment Variables)
5. Add environment variable:
   - Go to "Site configuration" → "Environment variables"
   - Click "Add a variable"
   - **Key**: `GEMINI_API_KEY`
   - **Value**: Your Gemini API key
6. Click "Deploy site"

### Option 2: Using Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod
```

When prompted:
- Choose "Create & configure a new site"
- Follow the prompts
- After deployment, add the environment variable:
  ```bash
  netlify env:set GEMINI_API_KEY "your-api-key-here"
  ```
- Redeploy: `netlify deploy --prod`

## Deploy to Vercel

### Option 1: Using Vercel UI

1. Go to [Vercel](https://vercel.com/)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add environment variable:
   - Click "Environment Variables"
   - **Name**: `GEMINI_API_KEY`
   - **Value**: Your Gemini API key
   - Select all environments (Production, Preview, Development)
6. Click "Deploy"

### Option 2: Using Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

When prompted:
- Link to existing project or create new
- Follow the prompts
- After deployment, add the environment variable:
  ```bash
  vercel env add GEMINI_API_KEY
  ```
  - Paste your API key when prompted
  - Select all environments
- Redeploy: `vercel --prod`

## Important Notes

### Environment Variables
- The app requires `GEMINI_API_KEY` to function
- Make sure to set this in your deployment platform's environment variables
- After adding the environment variable, you may need to trigger a new deployment

### Build Configuration
- Both `netlify.toml` and `vercel.json` files are included in the repository
- These files configure the build settings automatically
- Node.js version 22 is recommended (set in Netlify environment variables)

### Troubleshooting

**Build fails with "vite: not found"**
- Make sure Node.js version is set to 22 or higher
- Check that `npm install` runs before the build

**API errors in deployed app**
- Verify that `GEMINI_API_KEY` environment variable is set correctly
- Check the deployment logs for any error messages
- Make sure you've triggered a new deployment after adding environment variables

**404 errors on refresh**
- The configuration files include redirect rules for SPA routing
- If issues persist, check your deployment platform's redirect/rewrite settings

## Testing Your Deployment

After deployment:
1. Open your deployed URL
2. Try generating a UI component
3. Check browser console for any errors
4. If you see API errors, verify your environment variable is set correctly

## Getting a Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key and use it in your deployment environment variables

**Note**: Keep your API key secure and never commit it to your repository!
