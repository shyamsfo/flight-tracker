# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Package Manager
Use **yarn** (not npm) for all package operations.

## Build Commands

```bash
# Development server (runs on http://localhost:3000)
yarn dev

# Production build
yarn build

# Staging build
yarn staging

# Development build (same as production)
yarn devel

# Preview production build
yarn preview

# Lint code
yarn lint

# Watch mode for continuous builds
yarn watch
```

## Environment Configuration

The app uses Vite environment variables (prefixed with `VITE_`):

- `.env` - Development environment
- `.env.staging` - Staging environment
- `.env.prod` - Production environment

Key environment variables:
- `VITE_SERVICE_URL` - Backend API base URL
- `VITE_AUTH0_DOMAIN` - Auth0 domain
- `VITE_AUTH0_CLIENT_ID` - Auth0 client ID
- `VITE_AUTH0_AUDIENCE` - Auth0 API audience
- `VITE_AUTH0_REDIRECT_URL` - Post-login redirect URL
- `VITE_AUTH0_AFTER_LOGOUT_URL` - Post-logout redirect URL

## Architecture Overview

### Application Structure

This is a React SPA using HashRouter (not BrowserRouter) for routing. The app has two main feature areas:

1. **Flight Search** (`/flights`) - Mock flight search interface
2. **Mind Map** (`/mindmap`) - Interactive knowledge graph using ReactFlow
2. **BMI Calculator** (`/bmi`) - Interactive BMI Calculator

### Context Providers

Two global contexts wrap the entire app (see `src/main.jsx`):

1. **Auth0Context** (`src/context/Auth0Context.jsx`) - Manages authentication state using Auth0 SPA SDK
   - Provides: `isAuthenticated`, `user`, `isLoading`, `login()`, `logout()`, `getAccessToken()`
   - Uses `localstorage` cache location
   - Hash-based redirect URIs: `/#/afterlogin` and `/#/afterlogout`

2. **ThemeContext** (`src/context/ThemeContext.jsx`) - Manages light/dark theme
   - Stores theme in localStorage with key `flight-tracker-theme`
   - Sets `data-theme` attribute on document element

### Routing

Uses HashRouter (not BrowserRouter). Routes:
- `/` - Landing page
- `/flights` - Flight search page
- `/mindmap` - Mind map explorer
- `/afterlogin` - Auth0 redirect target
- `/afterlogout` - Auth0 logout target

### API Layer

Currently uses **mock APIs** in `src/services/`:
- `mockFlightApi.js` - Simulated flight search
- `mockMindMapApi.js` - Simulated mind map data

These mock 500-800ms delays to simulate network requests. Replace these with real API calls when backend is ready.

### Development Server Proxy

Vite dev server proxies `/api/*` requests to `http://localhost:5000` (see `vite.config.js`). This is configured but not currently used since the app uses mock APIs.

### Mind Map Implementation

The mind map uses ReactFlow with custom node types:
- Custom node type `qaNode` (QANode component) displays question/answer cards
- Node positioning is calculated dynamically when adding child nodes
- Graph state managed via ReactFlow's `useNodesState` and `useEdgesState`
- New nodes can be added via floating action button (opens AddNodeModal)

### UI Framework

- Bootstrap 5 + React Bootstrap for UI components
- Custom CSS for layout and theming
- Theme switching via CSS variables and `data-theme` attribute
