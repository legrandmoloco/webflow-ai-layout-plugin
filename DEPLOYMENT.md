# Deployment Guide for Webflow AI Plugin

## Step 1: Deploy to Vercel

### Option A: Deploy via Vercel CLI (Recommended)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy from your project directory
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name: webflow-ai-plugin
# - Directory: ./
# - Override settings? No
```

### Option B: Deploy via Vercel Website
1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click "New Project"
3. Import your Git repository (or upload files)
4. Vercel will auto-detect the Node.js project
5. Click "Deploy"

## Step 2: Update Plugin URLs

After deployment, you'll get a URL like: `https://your-project.vercel.app`

Update the plugin to use this URL instead of localhost.

## Step 3: Upload to Webflow

1. Build the plugin: `npm run build`
2. Upload the `dist/` folder contents to Webflow
3. Make sure to include:
   - `index.html`
   - `main.js`
   - `manifest.json`

## Step 4: Test in Webflow Designer

The plugin should now work in Webflow Designer with the deployed proxy server handling CORS issues.

## Troubleshooting

- **CORS errors**: Check Vercel deployment logs
- **API timeouts**: Increase timeout in vercel.json
- **404 errors**: Verify proxy routes in vercel.json