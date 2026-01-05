# Attendance - ACS(A)

A Microsoft Teams app with Dataverse CRUD operations, built with React, Vite, and Fluent UI.

## Features

- ✅ Microsoft Teams integration
- ✅ Static page hosted on Teams
- ✅ API calls to backend
- ✅ Full CRUD operations on Dataverse
- ✅ User principal name tracking
- ✅ Modern UI with Fluent UI components

## Project Structure

```
NewTeamsApp/
├── api/
│   └── dataverse.php          # Backend API for Dataverse CRUD operations
├── src/
│   ├── App.jsx                # Main React component
│   ├── main.jsx               # React entry point with Teams SDK initialization
│   └── index.css              # Global styles
├── index.html                 # HTML template
├── manifest.json              # Teams app manifest
├── package.json               # Dependencies and scripts
├── vite.config.js             # Vite configuration
└── package-teams-app.js        # Script to package app for Teams

```

## Prerequisites

- Node.js 18+ and npm
- PHP server (for API)
- Azure AD App Registration with:
  - Dataverse API permissions
  - Client ID, Client Secret, Tenant ID
- Dataverse environment

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

For the API (`api/dataverse.php`), set these environment variables:

```bash
export AZURE_CLIENT_ID="your-client-id"
export AZURE_CLIENT_SECRET="your-client-secret"
export AZURE_TENANT_ID="your-tenant-id"
export DATAVERSE_URL="https://your-org.crm.dynamics.com"
```

### 3. Update API Configuration

Edit `api/dataverse.php`:

- Change `$ENTITY_NAME` to your Dataverse table logical name
- Update field names (`your_name_field`, `your_description_field`) to match your table schema
- Update the scope in `getAccessToken()` to match your Dataverse URL

### 4. Update Frontend API URL

Create a `.env` file or set environment variable:

```bash
VITE_API_BASE_URL=https://your-api-url.com
```

Or update `src/App.jsx` line 10:

```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://your-api-url.com';
```

### 5. Update Teams Manifest

Edit `manifest.json`:

- Update `id` with your Azure AD App Registration ID
- Update `packageName` with your package name
- Update `developer` information
- Update `contentUrl` and `websiteUrl` with your deployed URL
- Update `validDomains` with your domain
- Update `webApplicationInfo` with your App ID and resource URL

### 6. Add Icons

Add your app icons to `teams-app-package/`:
- `icon-outline.png` (192x192)
- `icon-color.png` (192x192)

## Development

### Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

### Package for Teams

```bash
npm run package
```

This creates a `teams-app-package/` folder with:
- Built files from `dist/`
- `manifest.json`
- Icons (if added)

## Deployment

### Frontend (Static Site)

Deploy the `dist/` folder to:
- Azure Static Web Apps
- Netlify
- Any static hosting service

### Backend (API)

Deploy `api/dataverse.php` to:
- Azure App Service
- Any PHP hosting service

Make sure to set environment variables on your hosting platform.

## Teams App Installation

1. Build and package the app: `npm run package`
2. Zip the `teams-app-package/` folder
3. Upload to Teams:
   - **For testing**: Use App Studio in Teams or sideload via Developer Portal
   - **For production**: Upload via Teams Admin Center

## API Endpoints

The API (`api/dataverse.php`) supports:

- **GET** `/api/dataverse.php` - Fetch all items
- **POST** `/api/dataverse.php` - Create new item
- **PUT** `/api/dataverse.php` - Update existing item
- **DELETE** `/api/dataverse.php` - Delete item

### Request/Response Examples

**Create (POST):**
```json
{
  "name": "Item Name",
  "description": "Item Description",
  "createdBy": "user@domain.com"
}
```

**Update (PUT):**
```json
{
  "id": "guid-here",
  "name": "Updated Name",
  "description": "Updated Description",
  "modifiedBy": "user@domain.com"
}
```

**Delete (DELETE):**
```json
{
  "id": "guid-here"
}
```

## Customization

### Change Dataverse Table

1. Update `$ENTITY_NAME` in `api/dataverse.php`
2. Update field mappings in CREATE/UPDATE operations
3. Adjust the form fields in `src/App.jsx` to match your table schema

### Add More Fields

1. Add input fields in `src/App.jsx` form
2. Update `formData` state
3. Update API field mappings in `api/dataverse.php`

## Troubleshooting

### Teams SDK Not Loading

- Ensure the Teams SDK script is loaded in `index.html`
- Check browser console for errors
- Verify the app is running in Teams context

### API Errors

- Check environment variables are set correctly
- Verify Azure AD permissions
- Check Dataverse table name and field names
- Review API logs for detailed error messages

### CORS Issues

- Ensure CORS headers are set in `api/dataverse.php`
- Verify `validDomains` in `manifest.json` includes your API domain

## License

MIT

