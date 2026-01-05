# Upload Attendance App to Microsoft Teams

## Prerequisites

1. ✅ App is deployed to Azure Static Web Apps: `https://lemon-meadow-03d34c000.6.azurestaticapps.net`
2. ✅ Manifest.json is updated with the correct URL
3. ⚠️ You need to create/update the Azure AD App Registration for Teams
4. ⚠️ You need app icons (192x192 PNG files)

## Step 1: Create/Update Azure AD App Registration

The manifest currently has a placeholder App ID (`00000000-0000-0000-0000-000000000000`). You need a real one:

1. **Go to Azure Portal:**
   - https://portal.azure.com
   - Navigate to **Azure Active Directory** → **App registrations**

2. **Create or Update App Registration:**
   - If you already have one (for Dataverse), you can use that
   - Or create a new one: **+ New registration**
   - **Name:** `Attendance - ACS(A) Teams App`
   - **Supported account types:** Accounts in this organizational directory only
   - **Redirect URI:** 
     - Platform: **Single-page application (SPA)**
     - URI: `https://lemon-meadow-03d34c000.6.azurestaticapps.net`
   - Click **Register**

3. **Configure API Permissions:**
   - Go to **API permissions**
   - Add permission → **Microsoft Graph** → **Delegated permissions**
   - Add: `User.Read` (for identity)
   - Click **Add permissions**

4. **Expose an API:**
   - Go to **Expose an API**
   - Set **Application ID URI** to: `api://lemon-meadow-03d34c000.6.azurestaticapps.net/<YOUR_APP_ID>`
     - Replace `<YOUR_APP_ID>` with your actual Application (client) ID
   - Add a scope:
     - Scope name: `access_as_user`
     - Who can consent: **Admins and users**
     - Admin consent display name: `Access Attendance App`
     - Admin consent description: `Allow the app to access Attendance App on behalf of the signed-in user`
     - State: **Enabled**
     - Click **Add scope**

5. **Copy the Application (client) ID:**
   - From the **Overview** page, copy the **Application (client) ID**
   - You'll need this for the manifest

## Step 2: Update Manifest.json

Update the manifest with your real App ID:

1. **Edit `manifest.json`:**
   - Replace `"id": "00000000-0000-0000-0000-000000000000"` with your actual Application (client) ID
   - Update `webApplicationInfo.id` with the same ID
   - Update `webApplicationInfo.resource` to match your Expose an API URI:
     - Format: `api://lemon-meadow-03d34c000.6.azurestaticapps.net/<YOUR_APP_ID>`

2. **Update developer information (optional but recommended):**
   - Update `packageName` to something like `com.acsacademy.attendance`
   - Update `developer.name` to your organization name
   - Update `developer.websiteUrl`, `privacyUrl`, `termsOfUseUrl` if you have them

## Step 3: Create App Icons

You need two PNG icons (192x192 pixels):

1. **Create or find icons:**
   - `icon-outline.png` - Outline version (for Teams UI)
   - `icon-color.png` - Full color version (for Teams UI)
   - Both must be exactly 192x192 pixels

2. **Place icons in project root:**
   - They should be in the same directory as `manifest.json`
   - The packaging script will copy them automatically

## Step 4: Build the Teams Package

Run the packaging command:

```bash
npm run package
```

This will:
- Build the web app (`npm run build`)
- Create `teams-app-package/` folder
- Copy manifest.json
- Copy built files from `dist/`
- Copy icons (if they exist)

## Step 5: Verify Package Contents

Check that `teams-app-package/` contains:
- ✅ `manifest.json` (with real App ID)
- ✅ `dist/` folder with built files
- ✅ `icon-outline.png` (192x192)
- ✅ `icon-color.png` (192x192)

## Step 6: Create ZIP File

1. **Navigate to the teams-app-package folder:**
   ```bash
   cd teams-app-package
   ```

2. **Create ZIP file:**
   - **On macOS/Linux:**
     ```bash
     zip -r ../attendance-acsa-app.zip .
     ```
   - **On Windows:**
     - Select all files in `teams-app-package/`
     - Right-click → Send to → Compressed (zipped) folder
     - Rename to `attendance-acsa-app.zip`

3. **Important:** The ZIP must contain the files directly, not a folder
   - ✅ Correct: `manifest.json`, `dist/`, `icon-outline.png` in ZIP root
   - ❌ Wrong: `teams-app-package/manifest.json` in ZIP

## Step 7: Upload to Teams

### Option A: Sideload for Testing (Recommended First)

1. **Open Microsoft Teams**
2. **Go to Apps:**
   - Click **Apps** in the left sidebar
   - Click **Manage your apps** (or **Upload a custom app**)
3. **Upload:**
   - Click **Upload a custom app**
   - Select your `attendance-acsa-app.zip` file
   - Click **Add**
4. **Install:**
   - The app will appear in your apps list
   - Click on it to install
   - Pin it to your sidebar if desired

### Option B: Teams Admin Center (For Organization-Wide)

1. **Go to Teams Admin Center:**
   - https://admin.teams.microsoft.com
   - Sign in as Teams Administrator

2. **Navigate to Teams apps:**
   - Go to **Teams apps** → **Manage apps**
   - Click **+ New app**

3. **Upload:**
   - Upload your `attendance-acsa-app.zip`
   - Fill in app details
   - Set distribution (Org-wide, specific users, etc.)

4. **Publish:**
   - Review and publish
   - Users can then install from the Teams app store

## Step 8: Test the App

1. **Open Teams**
2. **Launch the app:**
   - Click on the app in your apps list
   - Or use the app from a chat/channel
3. **Verify:**
   - App loads correctly
   - Authentication works
   - API calls work
   - All features function as expected

## Troubleshooting

### "App installation failed"
- Check that the ZIP file structure is correct (files in root, not in a folder)
- Verify manifest.json is valid JSON
- Check that icons exist and are 192x192

### "Invalid manifest"
- Validate your manifest.json using: https://dev.teams.microsoft.com/apps
- Check that App ID matches your Azure AD App Registration
- Verify all required fields are filled

### "App not loading"
- Check that the deployed URL is accessible
- Verify `contentUrl` in manifest matches your deployment
- Check browser console for errors
- Verify CORS settings if making API calls

### "Authentication failed"
- Verify Azure AD App Registration redirect URI matches your app URL
- Check that API permissions are granted
- Verify `webApplicationInfo.resource` matches your Expose an API URI

## Quick Checklist

Before uploading:
- [ ] Azure AD App Registration created/updated
- [ ] App ID copied and added to manifest.json
- [ ] `webApplicationInfo.resource` updated with correct URI
- [ ] Icons created (192x192 PNG)
- [ ] App deployed to Azure Static Web Apps
- [ ] `npm run package` completed successfully
- [ ] ZIP file created with correct structure
- [ ] Manifest validated (optional but recommended)

## Next Steps After Upload

1. **Test thoroughly** in Teams
2. **Gather feedback** from users
3. **Update and repackage** as needed
4. **Submit for organization approval** (if required)
5. **Distribute to users** via Teams Admin Center

