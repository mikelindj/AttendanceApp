# Troubleshooting Azure Static Web Apps Deployment

## Current Error
```
No matching Static Web App was found or the api key was invalid.
```

## Required GitHub Secret
The workflow expects this exact secret name:
```
AZURE_STATIC_WEB_APPS_API_TOKEN_AMBITIOUS_ROCK_0F3C0F100
```

## Step-by-Step Fix

### Option 1: If You Already Have a Static Web App in Azure

1. **Verify the Static Web App exists:**
   - Go to https://portal.azure.com
   - Search for "Static Web Apps"
   - Find your app (should be named something like "ambitious-rock-0f3c0f100")
   - If it doesn't exist, see Option 2 below

2. **Get the Deployment Token:**
   - Click on your Static Web App
   - In the left sidebar, click **"Manage deployment token"**
   - OR go to **Settings** → **Deployment token**
   - Click **"Copy token"** or **"Show token"**
   - Copy the entire token (it's a long string)

3. **Add to GitHub Secrets:**
   - Go to: https://github.com/mikelindj/AttendanceApp/settings/secrets/actions
   - Click **"New repository secret"**
   - **Name:** `AZURE_STATIC_WEB_APPS_API_TOKEN_AMBITIOUS_ROCK_0F3C0F100`
     - ⚠️ **CRITICAL:** Must match exactly, including all uppercase letters and underscores
   - **Secret:** Paste the token you copied
   - Click **"Add secret"**

4. **Verify the Secret:**
   - Go back to Secrets page
   - You should see `AZURE_STATIC_WEB_APPS_API_TOKEN_AMBITIOUS_ROCK_0F3C0F100` in the list
   - Make sure there are no extra spaces or typos

5. **Re-run the Workflow:**
   - Go to: https://github.com/mikelindj/AttendanceApp/actions
   - Click on the failed workflow
   - Click **"Re-run jobs"** → **"Re-run failed jobs"**

### Option 2: If You Don't Have a Static Web App Yet

**Create the Static Web App through Azure Portal (Recommended):**

1. **Go to Azure Portal:**
   - https://portal.azure.com

2. **Create Static Web App:**
   - Click **"Create a resource"** (or **"+ Create"**)
   - Search for **"Static Web App"**
   - Click **"Create"**

3. **Fill in the form:**
   - **Subscription:** Select your subscription
   - **Resource Group:** Create new or select existing
   - **Name:** e.g., `attendance-acsa` (this will create a unique URL)
   - **Plan type:** Free (or Standard)
   - **Region:** Choose closest to you
   - **Source:** GitHub
   - **GitHub account:** Click "Sign in with GitHub" and authorize
   - **Organization:** Select your GitHub username/organization
   - **Repository:** `AttendanceApp`
   - **Branch:** `main`
   - **Build Presets:** **Custom**
   - **App location:** `/`
   - **Api location:** (leave empty)
   - **Output location:** `dist`

4. **Review and Create:**
   - Click **"Review + create"**
   - Click **"Create"**

5. **Azure will automatically:**
   - Create the GitHub Actions workflow (you'll see a PR in your repo)
   - Add the deployment token as a GitHub secret
   - Set up the CI/CD pipeline

6. **Merge the PR:**
   - Go to your GitHub repository
   - You should see a PR from `azure-actions` or `github-actions[bot]`
   - Review and merge it (it will have the correct workflow file)

### Option 3: Manual Workflow Setup (If Azure didn't create one)

If Azure created the Static Web App but didn't create the workflow, you can:

1. **Get the deployment token from Azure** (as in Option 1, step 2)

2. **Update the workflow file** to match your Static Web App name:
   - The secret name includes `AMBITIOUS_ROCK_0F3C0F100` which is part of your app name
   - If your app has a different name, you need to either:
     a. Update the workflow file to use the correct secret name
     b. Or create a secret with the name that matches your app

3. **Find your Static Web App's deployment token name:**
   - In Azure Portal, go to your Static Web App
   - Go to **"Deployment"** → **"Deployment tokens"**
   - The token name format is usually: `AZURE_STATIC_WEB_APPS_API_TOKEN_<APP_NAME>`
   - Use that exact name in GitHub Secrets

## Common Issues

### Issue 1: Secret Name Mismatch
- **Symptom:** Error persists after adding secret
- **Fix:** Double-check the secret name matches exactly (case-sensitive)
- **Check:** Go to GitHub Settings → Secrets → Actions and verify the name

### Issue 2: Token Expired or Invalid
- **Symptom:** Error persists with correct secret name
- **Fix:** 
  1. Go to Azure Portal → Your Static Web App
  2. Go to **"Manage deployment token"**
  3. Click **"Reset token"** or **"Regenerate"**
  4. Copy the new token
  5. Update the GitHub secret with the new token

### Issue 3: Static Web App Doesn't Exist
- **Symptom:** Can't find the app in Azure Portal
- **Fix:** Create it using Option 2 above

### Issue 4: Wrong Resource Group or Subscription
- **Symptom:** Can't find the app
- **Fix:** 
  - Check you're in the correct Azure subscription
  - Check the correct resource group
  - Use the search bar in Azure Portal to find "Static Web Apps"

## Verification Steps

After adding the secret, verify:

1. ✅ Secret exists in GitHub: https://github.com/mikelindj/AttendanceApp/settings/secrets/actions
2. ✅ Secret name matches exactly: `AZURE_STATIC_WEB_APPS_API_TOKEN_AMBITIOUS_ROCK_0F3C0F100`
3. ✅ Static Web App exists in Azure Portal
4. ✅ Token was copied correctly (no extra spaces, full token)
5. ✅ Workflow re-run after adding secret

## Still Not Working?

If it still fails after following these steps:

1. **Check the workflow logs:**
   - Go to Actions → Failed workflow → Click on the failed step
   - Look for more detailed error messages

2. **Verify the Static Web App name:**
   - The name in the secret (`AMBITIOUS_ROCK_0F3C0F100`) should match part of your Static Web App's actual name or resource ID
   - If they don't match, you may need to update the workflow file

3. **Try creating a new Static Web App:**
   - Delete the old one (if it exists)
   - Create a new one through Azure Portal
   - Let Azure auto-generate the workflow
   - This ensures everything is correctly configured

