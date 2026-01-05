# Verify Azure Static Web App Setup

## Current Status
✅ GitHub secret exists and is being read correctly  
❌ Azure is rejecting the token: "No matching Static Web App was found or the api key was invalid"

This means either:
1. The Static Web App resource doesn't exist in Azure
2. The token doesn't match the Static Web App
3. The Static Web App name/ID doesn't match what's expected

## Step 1: Verify Static Web App Exists

1. **Go to Azure Portal:**
   - https://portal.azure.com
   - Sign in

2. **Search for Static Web Apps:**
   - In the top search bar, type: `Static Web Apps`
   - Click on "Static Web Apps" service

3. **Check if your app exists:**
   - Look for an app with a name containing `ambitious-rock` or similar
   - If you see **no results**, the resource doesn't exist → **Go to Step 2**
   - If you see an app, note its exact name → **Go to Step 3**

## Step 2: Create the Static Web App (If It Doesn't Exist)

### Option A: Create via Azure Portal (Recommended)

1. **In Azure Portal:**
   - Click **"+ Create"** or **"Create a resource"**
   - Search for **"Static Web App"**
   - Click **"Create"**

2. **Fill in the Basics tab:**
   - **Subscription:** Your subscription
   - **Resource Group:** Create new (e.g., `attendance-app-rg`) or use existing
   - **Name:** Choose a name (e.g., `attendance-acsa-app`)
     - ⚠️ This will be part of your URL: `https://<name>.azurestaticapps.net`
   - **Plan type:** Free (or Standard if you need more features)
   - **Region:** Choose closest to you
   - Click **"Next: Deployment"**

3. **Fill in the Deployment tab:**
   - **Source:** GitHub
   - **GitHub account:** Click **"Sign in with GitHub"** and authorize
   - **Organization:** Select your GitHub username (`mikelindj`)
   - **Repository:** `AttendanceApp`
   - **Branch:** `main`
   - **Build Presets:** **Custom**
   - **App location:** `/`
   - **Api location:** (leave empty - your API is on a separate server)
   - **Output location:** `dist`
   - Click **"Review + create"**

4. **Review and Create:**
   - Review the settings
   - Click **"Create"**

5. **Wait for deployment:**
   - Azure will create the resource (takes 1-2 minutes)
   - Azure will automatically:
     - Create a GitHub Actions workflow file
     - Add the deployment token as a GitHub secret
     - Set up the CI/CD pipeline

6. **Check GitHub:**
   - Go to your repository: https://github.com/mikelindj/AttendanceApp
   - You should see a new Pull Request from `azure-actions` or `github-actions[bot]`
   - This PR will contain the correct workflow file
   - **Review and merge this PR** - it will have the correct configuration

### Option B: Create via Azure CLI

If you prefer command line:

```bash
# Login to Azure
az login

# Create resource group (if needed)
az group create --name attendance-app-rg --location eastus

# Create Static Web App
az staticwebapp create \
  --name attendance-acsa-app \
  --resource-group attendance-app-rg \
  --source https://github.com/mikelindj/AttendanceApp \
  --branch main \
  --location eastus2 \
  --app-location "/" \
  --output-location "dist"
```

## Step 3: Verify Token Matches (If App Exists)

If the Static Web App already exists:

1. **In Azure Portal:**
   - Click on your Static Web App
   - Go to **"Settings"** → **"Deployment tokens"** (or **"Manage deployment token"**)

2. **Get the correct token:**
   - You should see a deployment token
   - The token name format should be: `AZURE_STATIC_WEB_APPS_API_TOKEN_<APP_NAME>`
   - Copy the token value

3. **Update GitHub Secret:**
   - Go to: https://github.com/mikelindj/AttendanceApp/settings/secrets/actions
   - Find or create: `AZURE_STATIC_WEB_APPS_API_TOKEN_AMBITIOUS_ROCK_0F3C0F100`
   - Update it with the token from Azure
   - OR if the token name is different, update the workflow file to match

4. **Check the workflow file:**
   - The workflow references: `AZURE_STATIC_WEB_APPS_API_TOKEN_AMBITIOUS_ROCK_0F3C0F100`
   - If your app has a different name, you may need to:
     - Update the workflow file to use the correct secret name
     - Or create a secret with the name that matches your app

## Step 4: Update Workflow File (If Needed)

If your Static Web App has a different name than `ambitious-rock-0f3c0f100`, you need to update the workflow:

1. **Find your app's deployment token name:**
   - Azure Portal → Your Static Web App → Deployment tokens
   - Note the exact token name format

2. **Update the workflow file:**
   - Edit: `.github/workflows/azure-static-web-apps-ambitious-rock-0f3c0f100.yml`
   - Replace `AZURE_STATIC_WEB_APPS_API_TOKEN_AMBITIOUS_ROCK_0F3C0F100` with your actual token name
   - Or rename the file to match your app name

3. **Add the correct secret to GitHub:**
   - Use the token name that matches your Static Web App

## Quick Diagnostic Commands

If you have Azure CLI installed, you can check:

```bash
# List all Static Web Apps
az staticwebapp list --output table

# Get deployment token for a specific app
az staticwebapp secrets list \
  --name <your-app-name> \
  --resource-group <resource-group-name>
```

## Most Likely Solution

Based on the error, the **Static Web App resource probably doesn't exist yet**. 

**Recommended action:** Create it through Azure Portal (Step 2, Option A) and let Azure auto-generate the workflow. This ensures everything is correctly configured.

After creating the app and merging Azure's auto-generated PR, the deployment should work automatically.

