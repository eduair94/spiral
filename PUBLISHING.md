# Ì∫Ä Publishing to GitHub Pages

This guide explains how to publish the Golden Spiral Generator to GitHub Pages.

## Prerequisites

- Git installed and configured
- GitHub account
- Node.js 18+ installed

## Automatic Deployment (Recommended)

This project uses GitHub Actions for automatic deployment. Every push to the `main` or `master` branch triggers a build and deploy.

### Step 1: Push to GitHub

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Golden Spiral Generator"

# Add remote (replace with your repo URL)
git remote add origin https://github.com/eduair94/spiral.git

# Push to main/master branch
git push -u origin master
```

### Step 2: Enable GitHub Pages

1. Go to your repository on GitHub: https://github.com/eduair94/spiral
2. Click **Settings** (gear icon)
3. Scroll down to **Pages** in the left sidebar
4. Under **Build and deployment**:
   - **Source**: Select **GitHub Actions**
5. Save the settings

### Step 3: Wait for Deployment

1. Go to the **Actions** tab in your repository
2. You should see a workflow running called "Deploy to GitHub Pages"
3. Wait for it to complete (usually 1-2 minutes)
4. Once complete, your site will be live at: **https://eduair94.github.io/spiral/**

## Manual Deployment (Alternative)

If you prefer manual deployment or the Actions workflow fails:

```bash
# Build the project
npm run build

# Install gh-pages if not already installed
npm install -g gh-pages

# Deploy to gh-pages branch
npx gh-pages -d dist
```

Then in GitHub Settings > Pages:
- **Source**: Deploy from a branch
- **Branch**: gh-pages / (root)

## Troubleshooting

### 404 Error on Page Load

1. Verify the `base` path in `vite.config.ts` matches your repo name:
   ```typescript
   base: "/spiral/",
   ```

2. Make sure GitHub Pages is enabled and pointing to the correct source.

### Workflow Fails

1. Check the Actions tab for error logs
2. Ensure `package-lock.json` exists (required for `npm ci`)
3. Verify Node.js version compatibility

### Assets Not Loading

1. Clear browser cache
2. Check browser console for 404 errors
3. Verify all paths are relative or use the base path

## Updating the Site

After making changes:

```bash
git add .
git commit -m "Your commit message"
git push
```

The GitHub Action will automatically rebuild and deploy.

## Live URL

Ìºê **https://eduair94.github.io/spiral/**
