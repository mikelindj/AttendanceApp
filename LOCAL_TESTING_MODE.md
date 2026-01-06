# Local Testing Mode - Teams Restriction Disabled

## ⚠️ TEMPORARY: This file documents where restrictions are disabled for local testing

**IMPORTANT:** Re-enable all restrictions before deploying to production!

## Locations Where Restrictions Are Disabled

### 1. Teams Check (Lines ~442-453)
**File:** `src/Attendance.jsx`

**Current State:** DISABLED
- The check for `window.microsoftTeams` is commented out
- `setIsInTeams(true)` is set directly to allow local testing

**To Re-enable:**
1. Uncomment lines 444-449 (the Teams check)
2. Remove line 453 or change it back to: `setIsInTeams(true);` (only set if Teams is detected)

### 2. Domain Authentication Check (Lines ~455-476)
**File:** `src/Attendance.jsx`

**Current State:** DISABLED
- Domain check is commented out
- Authentication is automatically granted for local testing

**To Re-enable:**
1. Uncomment lines 469-476 (the domain check)
2. Remove the temporary lines that set `setIsAuthenticated(true)` unconditionally
3. Restore the original domain validation logic

### 3. Teams Required Error Screen (Lines ~855-872)
**File:** `src/Attendance.jsx`

**Current State:** DISABLED
- The error screen that shows "Teams Required" is commented out

**To Re-enable:**
1. Uncomment lines 856-872 (the Teams Required error screen)

### 4. Authentication Loading Screen (Lines ~854-868)
**File:** `src/Attendance.jsx`

**Current State:** DISABLED
- The "Checking authentication..." loading screen is commented out
- `authChecked` is set to `true` immediately to skip the loading state

**To Re-enable:**
1. Uncomment lines 855-868 (the authentication loading screen)
2. Remove the early `setAuthChecked(true)` calls in the `checkAuthentication` function

### 5. Access Denied Screen (Lines ~891-928)
**File:** `src/Attendance.jsx`

**Current State:** DISABLED
- The "Access Denied" error screen is commented out
- `isAuthenticated` state is initialized to `true` instead of `false`

**To Re-enable:**
1. Uncomment lines 892-928 (the Access Denied error screen)
2. Change line 333: `useState(true)` back to `useState(false)`

## Quick Re-enable Instructions

1. **Open:** `src/Attendance.jsx`
2. **Search for:** `TEMPORARY: Disabled for local testing`
3. **Uncomment all sections** marked with `TEMPORARY:`
4. **Remove all lines** that say `// TEMPORARY: Allow local testing`
5. **Restore original logic** in the `checkAuthentication` function

## What's Currently Disabled

✅ Teams detection check  
✅ Domain authentication requirement  
✅ Teams Required error screen  
✅ Authentication loading screen ("Checking authentication...")  
✅ Access Denied error screen  

## Current Behavior

- App works in any browser (not just Teams)
- No domain validation required
- Authentication is automatically granted
- Uses test email: `test@acsacademy.edu.sg`

## After Re-enabling

- App will only work in Microsoft Teams
- Requires `@acsacademy.edu.sg` domain
- Shows appropriate error messages for unauthorized access

