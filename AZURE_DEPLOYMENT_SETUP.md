# Azure Static Web Apps Deployment Setup

## Problem
The GitHub Actions workflow is failing with:
```
No matching Static Web App was found or the api key was invalid.
```

This means the deployment token is missing or incorrect in GitHub Secrets.

## Solution: Add the Deployment Token to GitHub Secrets

### Step 1: Get the Deployment Token from Azure

1. **Go to Azure Portal**
   - Navigate to: https://portal.azure.com
   - Sign in with your Azure account

2. **Find your Static Web App**
   - Search for "Static Web Apps" in the top search bar
   - Click on your Static Web App resource (likely named something like "ambitious-rock-0f3c0f100")

3. **Get the Deployment Token**
   - In the left sidebar, click on **"Manage deployment token"** (or go to **Settings** → **Deployment token**)
   - Copy the deployment token (it's a long string)

### Step 2: Add the Token to GitHub Secrets

1. **Go to your GitHub Repository**
   - Navigate to: `https://github.com/mikelindj/AttendanceApp`

2. **Open Repository Settings**
   - Click on **Settings** tab (top menu)
   - In the left sidebar, click **Secrets and variables** → **Actions**

3. **Add the Secret**
   - Click **New repository secret**
   - **Name:** `AZURE_STATIC_WEB_APPS_API_TOKEN_AMBITIOUS_ROCK_0F3C0F100`
     - ⚠️ **Important:** The name must match exactly what's in the workflow file
   - **Value:** Paste the deployment token you copied from Azure
   - Click **Add secret**

### Step 3: Verify the Workflow

1. **Trigger a new workflow run**
   - Go to **Actions** tab in your GitHub repository
   - Click on the failed workflow run
   - Click **Re-run jobs** → **Re-run failed jobs**
   - Or push a new commit to trigger the workflow

2. **Check the deployment**
   - The workflow should now succeed
   - Your app will be deployed to: `https://ambitious-rock-0f3c0f100.1.azurestaticapps.net`

## Alternative: If You Don't Have a Static Web App Yet

If you haven't created the Azure Static Web App resource yet:

1. **Create Static Web App in Azure**
   - Go to Azure Portal
   - Click **Create a resource**
   - Search for "Static Web App"
   - Fill in the details:
     - **Subscription:** Your subscription
     - **Resource Group:** Create new or use existing
     - **Name:** e.g., "attendance-acsa" (this will generate a unique URL)
     - **Plan type:** Free (or Standard if you need more features)
     - **Region:** Choose closest to you
     - **Source:** GitHub
     - **GitHub account:** Sign in and authorize
     - **Organization:** Your GitHub org/username
     - **Repository:** `AttendanceApp`
     - **Branch:** `main`
     - **Build Presets:** Custom
     - **App location:** `/`
     - **Api location:** (leave empty)
     - **Output location:** `dist`

2. **Azure will automatically:**
   - Create the GitHub Actions workflow (you may need to merge it)
   - Add the deployment token as a GitHub secret
   - Set up the CI/CD pipeline

## Troubleshooting

### Token Not Working
- Make sure the secret name matches exactly: `AZURE_STATIC_WEB_APPS_API_TOKEN_AMBITIOUS_ROCK_0F3C0F100`
- Verify the token hasn't expired (regenerate it in Azure if needed)
- Check that the Static Web App resource exists and is active

### Wrong Resource Name
- The token name includes `AMBITIOUS_ROCK_0F3C0F100` which is part of your Static Web App name
- If your Static Web App has a different name, you may need to update the workflow file

### Workflow File Location
- The workflow file is at: `.github/workflows/azure-static-web-apps-ambitious-rock-0f3c0f100.yml`
- If Azure created a different workflow file, you may need to use that one instead

