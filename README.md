<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally and deploy it to production.

View your app in AI Studio: https://ai.studio/apps/drive/1ik2cE-XON7XfxgemsLmSaX0hFnINkEqD

## Run Locally

**Prerequisites:**  Node.js (version 22 recommended)


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy to Production

For detailed deployment instructions to Netlify or Vercel, see [DEPLOYMENT.md](DEPLOYMENT.md).

**Quick Start:**
1. Get a Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Deploy to Netlify or Vercel via their UI
3. Set `GEMINI_API_KEY` environment variable in your deployment platform
4. Deploy!

See [DEPLOYMENT.md](DEPLOYMENT.md) for step-by-step instructions.
