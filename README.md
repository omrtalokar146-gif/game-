<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/15b6ac8e-6e10-48be-8509-d78b76616340

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the backend server in another terminal:
   `npm run dev:server`
4. In a separate terminal, run the frontend:
   `npm run dev`

Alternatively, run both together with:
   `npm run dev:all`
