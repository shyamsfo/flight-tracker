# Authentication Architecture

This document describes the current authentication implementation and planned enhancements.

## Overview

The app uses **Auth0** for authentication with a React SPA frontend and Flask backend. Auth0 handles identity (who is this user?), and the backend verifies JWT access tokens to protect API routes.

## Current Implementation

### Frontend (React + Auth0 SPA SDK)

**Auth0 Client Configuration** (`src/context/Auth0Context.jsx`):
- Auth0 SPA SDK (`@auth0/auth0-spa-js`) initialized as a React context provider
- Redirect-based login flow using Auth0's Universal Login page
- `cacheLocation: 'localstorage'` — tokens persist across page refreshes
- `useRefreshTokens: true` — uses refresh tokens instead of silent iframe-based auth, which fixes session loss in Safari, Firefox, and incognito/private browsing modes
- Audience set to `https://demo_api.dsrag.dev` to request API-scoped access tokens

**Context API** (`useAuth0` hook) exposes:
- `isAuthenticated` — boolean login state
- `user` — Auth0 user profile (name, email, picture, sub, etc.)
- `isLoading` — true while Auth0 SDK initializes
- `login()` — triggers redirect to Auth0 Universal Login
- `logout()` — logs out and redirects to `/#/afterlogout`
- `getAccessToken()` — returns a JWT access token via `getTokenSilently()`

**Routing** (HashRouter):
- `/#/afterlogin` — post-login landing page, handles the Auth0 redirect callback
- `/#/afterlogout` — post-logout page
- `/#/userinfo` — displays frontend + backend user info side by side

**Auth UI** (`src/components/AuthButton.jsx`):
- Fixed-position circular button in top-right corner
- Unauthenticated: shows login button
- Authenticated: shows user avatar with dropdown containing User Info link and Logout

**API Calls** (`src/lib/api_utils.js`):
- All API calls include `Authorization: Bearer <token>` header
- `get_data`, `post_data`, `put_data`, `patch_data`, `delete_data` utility functions
- Base URL from `VITE_SERVICE_URL` environment variable

**Protected Pages**:
- Flight search (`src/pages/Home.jsx`) requires authentication. Unauthenticated users see a "Login Required" card with a login button instead of the search UI

### Backend (Flask)

**Location**: `backend/app.py`

**JWT Verification**:
- Fetches Auth0 JWKS from `https://{AUTH0_DOMAIN}/.well-known/jwks.json` (cached via `lru_cache`)
- Verifies JWT signature (RS256), expiry, audience, and issuer using PyJWT

**`@require_auth` Decorator**:
- Extracts `Authorization: Bearer <token>` from request headers
- Decodes and verifies the JWT
- Stores decoded claims on `g.jwt_claims` and raw token on `g.access_token`
- Returns 401 with specific error messages for expired, invalid audience, or invalid issuer tokens
- Any route decorated with `@require_auth` is protected

**Endpoints**:
| Endpoint | Auth | Description |
|---|---|---|
| `GET /health` | No | Health check, returns `{"status": "ok"}` |
| `GET /verify` | Yes | Returns decoded JWT claims + Auth0 /userinfo profile |
| `GET /flights` | Yes | Returns all mock flights |
| `GET /flights/search?q=<term>` | Yes | Searches flights by flight number (case-insensitive partial match) |

**Environment** (`backend/.env`):
- `AUTH0_DOMAIN` — Auth0 tenant domain
- `AUTH0_AUDIENCE` — Expected JWT audience

**Running the backend**:
```bash
cd backend
source .venv/bin/activate
start_server          # or: python app.py
# Runs on http://localhost:5004
```

### Environment Variables

**Frontend** (`.env`):
- `VITE_SERVICE_URL` — Backend API base URL (e.g., `https://demo_api.dsrag.dev`)
- `VITE_AUTH0_DOMAIN` — Auth0 tenant domain
- `VITE_AUTH0_CLIENT_ID` — Auth0 SPA application client ID
- `VITE_AUTH0_AUDIENCE` — Auth0 API identifier
- `VITE_AUTH0_REDIRECT_URL` — Post-login redirect URI
- `VITE_AUTH0_AFTER_LOGOUT_URL` — Post-logout redirect URI

**Backend** (`backend/.env`):
- `AUTH0_DOMAIN` — Auth0 tenant domain
- `AUTH0_AUDIENCE` — Expected JWT audience

### Dev Server Proxy

Vite proxies `/api/*` requests to `http://localhost:5004` during development (`vite.config.js`). In production, nginx handles routing to the backend.

---

## Future Enhancements

### RBAC — Roles & Permissions

**What**: Define permissions (e.g., `read:flights`, `write:flights`, `read:admin`) on the Auth0 API, create roles (e.g., `admin`, `editor`, `viewer`), and assign them to users. Permissions are embedded in the JWT `permissions` claim.

**Auth0 Dashboard Setup**:
1. Go to Applications > APIs > your API > Settings
2. Enable "Add Permissions in the Access Token" (RBAC)
3. Define permissions under the Permissions tab
4. Create roles under User Management > Roles
5. Assign permissions to roles, roles to users

**Backend Implementation**: Add a `@require_permission` decorator that checks `g.jwt_claims["permissions"]` for the required permission string. Returns 403 if missing.

**Frontend Implementation**: Read permissions from the access token (decode client-side, or fetch from backend) to conditionally show/hide UI elements like admin panels or edit buttons.

### Multifactor Authentication (MFA)

**What**: Require a second factor (TOTP app, SMS, email, or WebAuthn/passkeys) during login.

**Auth0 Dashboard Setup**:
1. Go to Security > Multi-factor Auth
2. Enable desired factors (e.g., One-time Password)
3. Set policy: Always, Never, or Adaptive (risk-based)

**Code Changes**: None required. The Auth0 SDK handles the MFA challenge automatically during the redirect login flow. Can be enforced conditionally via Auth0 Actions (e.g., only for admin roles).

### Post-Login Actions (Token Enrichment)

**What**: Auth0 Actions are serverless functions that run at specific points in the auth pipeline. A post-login Action can enrich the access token with custom claims.

**Use Cases**:
- Add user's subscription tier from your database to the token
- Add feature flags
- Add the user's internal database ID
- Log login events to an external service
- Block login for suspended users

**Auth0 Dashboard Setup**:
1. Go to Actions > Flows > Login
2. Create a custom Action (Node.js)
3. Add custom claims to the access token via `api.accessToken.setCustomClaim()`

**Example Action**:
```javascript
exports.onExecutePostLogin = async (event, api) => {
  api.accessToken.setCustomClaim('https://myapp.com/roles', event.authorization?.roles);
  api.accessToken.setCustomClaim('https://myapp.com/tier', 'pro');
};
```

Custom claims must use a namespaced key (URL format) to avoid collisions with standard JWT claims.

### Social & Enterprise Login

**What**: Add Google, GitHub, Microsoft, or SAML/OIDC enterprise connections alongside username/password.

**Auth0 Dashboard Setup**:
1. Go to Authentication > Social (or Enterprise)
2. Enable and configure the desired provider (e.g., Google — requires OAuth client ID/secret from Google Cloud Console)
3. Enable the connection for your application

**Code Changes**: None. The Universal Login page automatically shows all enabled connections.

### User Metadata

**What**: Store user preferences (`user_metadata`) and admin-controlled data (`app_metadata`) on the Auth0 user profile.

**Why Backend**: The Auth0 Management API is required to read/write metadata, and it needs a client secret that must stay server-side.

**Implementation**:
1. Create a Machine-to-Machine application in Auth0 dashboard
2. Store its client ID and secret in `backend/.env`
3. Backend obtains an M2M token via client credentials grant
4. Use the Management API to read/update user metadata
5. Frontend calls backend endpoints (e.g., `PATCH /user/preferences`)

**Alternative**: Store all user data in your own database, keyed by Auth0 `sub`. This is more flexible, queryable, and portable. Auth0 metadata is best for small, auth-adjacent data only.

### Federated Logout

**What**: Log the user out of the upstream identity provider (e.g., Google, corporate SSO) in addition to Auth0.

**Implementation**: Pass `federated: true` to the logout call:
```javascript
auth0Client.logout({ logoutParams: { returnTo: '...', federated: true } });
```

### Auth0 Log Streams

**What**: Stream authentication events (logins, failures, password changes) to external services.

**Use Cases**: Audit trail, security monitoring, analytics.

**Setup**: Dashboard only — Auth0 > Monitoring > Streams. Supports Datadog, Splunk, AWS EventBridge, custom webhooks, and more.

### Scoped Access Tokens

**What**: Request specific scopes from the frontend to limit what the access token can do.

**Implementation**:
```javascript
// Frontend: request specific scopes
const token = await auth0Client.getTokenSilently({
  authorizationParams: { scope: "read:flights write:flights" }
});
```

Backend verifies the `scope` claim in the JWT alongside permissions. Useful for least-privilege access patterns.

---

## File Reference

| File | Purpose |
|---|---|
| `src/context/Auth0Context.jsx` | Auth0 SDK initialization, React context provider |
| `src/components/AuthButton.jsx` | Auth UI (login button, user dropdown, logout) |
| `src/lib/api_utils.js` | Authenticated API call utilities |
| `src/pages/AfterLogin.jsx` | Post-login page with verify backend button |
| `src/pages/AfterLogout.jsx` | Post-logout page |
| `src/pages/UserInfo.jsx` | User info page (frontend + backend cards) |
| `src/pages/Home.jsx` | Flight search (backend API when auth'd, mock when not) |
| `src/services/mockFlightApi.js` | Client-side mock flight data (fallback) |
| `backend/app.py` | Flask backend with JWT verification and protected routes |
| `backend/.env` | Backend Auth0 config |
| `.env` | Frontend Auth0 + service config |
