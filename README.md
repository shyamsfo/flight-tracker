# Flight Tracker React App

> Generated with [Claude Code](https://claude.com/claude-code)

A multi-feature React single-page application (SPA) built with Vite, featuring authentication, theming, and multiple integrated tools.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Applications](#applications)
  - [Flight Search](#flight-search)
  - [Mind Map Explorer](#mind-map-explorer)
  - [BMI Calculator](#bmi-calculator)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Build Commands](#build-commands)
- [Environment Configuration](#environment-configuration)
- [Project Structure](#project-structure)
- [Authentication](#authentication)
- [Theming](#theming)

## Overview

This is a React-based SPA that combines multiple utility applications under a single unified interface. The app uses HashRouter for routing, Auth0 for authentication, and features a responsive design with light/dark theme support.

## Features

- **Multi-Application Platform**: Three distinct applications accessible through a unified navigation
- **Authentication**: Secure user authentication via Auth0
- **Theme Switching**: Light and dark mode support with persistent preferences
- **Responsive Design**: Mobile-friendly UI built with Bootstrap 5 and React Bootstrap
- **Modern Build System**: Powered by Vite for fast development and optimized production builds

## Applications

### Flight Search

**Route**: `/#/flights`

A mock flight search interface that simulates airline ticket search functionality.

**Features**:
- Flight search with origin and destination
- Date selection for departure and return
- Passenger count configuration
- Mock API responses (500-800ms simulated delays)

**Implementation**:
- Located in: `src/pages/Home.jsx`
- API Service: `src/services/mockFlightApi.js`
- Status: Currently uses mock data; ready for backend integration

### Mind Map Explorer

**Route**: `/#/mindmap`

An interactive knowledge graph visualization tool built with ReactFlow.

**Features**:
- Interactive node-based graph interface
- Custom Q&A node types displaying question/answer cards
- Dynamic node positioning
- Add new nodes via floating action button
- Pan, zoom, and drag functionality
- Visual relationship mapping

**Implementation**:
- Located in: `src/pages/MindMap.jsx`
- Custom Node Component: `src/components/QANode.jsx`
- API Service: `src/services/mockMindMapApi.js`
- Graph Library: ReactFlow v11

**Use Cases**:
- Knowledge base visualization
- Concept mapping
- Learning path creation
- Information relationship exploration

### BMI Calculator

**Route**: `/#/bmi`

A Body Mass Index (BMI) calculator with support for both metric and imperial units.

**Features**:
- Gender selection (Male, Female, Other)
- Dual unit system support:
  - Metric: centimeters (cm) and kilograms (kg)
  - Imperial: inches and pounds (lbs)
- Real-time BMI calculation
- Color-coded results based on health categories
- BMI category classification:
  - Underweight: < 18.5
  - Normal weight: 18.5 - 24.9
  - Overweight: 25 - 29.9
  - Obese: ≥ 30
- Educational information about BMI

**Implementation**:
- Located in: `src/pages/BMICalculator.jsx`
- Styling: `src/components/BMICalculator.css`
- Uses React Bootstrap form components

## Tech Stack

### Core
- **React** 18.2 - UI framework
- **Vite** 5.0 - Build tool and dev server
- **React Router DOM** 7.9 - Routing (HashRouter)

### UI/Styling
- **Bootstrap** 5.3 - CSS framework
- **React Bootstrap** 2.9 - React components
- **ReactFlow** 11.11 - Graph visualization

### Authentication
- **Auth0 SPA JS** 2.7 - Authentication SDK

### Development
- **ESLint** - Code linting
- **React DevTools** compatible

## Getting Started

### Prerequisites

- Node.js (v14 or higher recommended)
- npm or yarn package manager

### Installation

```bash
# Install dependencies
npm install
```

### Development Server

```bash
# Start development server at http://localhost:3000
npm run dev
```

### Access the Application

Once the dev server is running, open your browser to:
```
http://localhost:3000
```

Navigate to different applications:
- Landing Page: `http://localhost:3000/#/`
- Flight Search: `http://localhost:3000/#/flights`
- Mind Map: `http://localhost:3000/#/mindmap`
- BMI Calculator: `http://localhost:3000/#/bmi`

## Build Commands

```bash
# Development server (runs on http://localhost:3000)
npm run dev

# Production build
npm run build

# Staging build
npm run staging

# Development build
npm run devel

# Preview production build
npm run preview

# Lint code
npm run lint

# Watch mode for continuous builds
npm run watch
```

## Environment Configuration

The app uses Vite environment variables (prefixed with `VITE_`).

### Environment Files

- `.env` - Development environment
- `.env.staging` - Staging environment
- `.env.prod` - Production environment

### Key Environment Variables

```bash
VITE_SERVICE_URL=          # Backend API base URL
VITE_AUTH0_DOMAIN=         # Auth0 domain
VITE_AUTH0_CLIENT_ID=      # Auth0 client ID
VITE_AUTH0_AUDIENCE=       # Auth0 API audience
VITE_AUTH0_REDIRECT_URL=   # Post-login redirect URL
VITE_AUTH0_AFTER_LOGOUT_URL= # Post-logout redirect URL
```

## Project Structure

```
flight-tracker-react-app/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── HamburgerMenu.jsx
│   │   ├── Sidebar.jsx
│   │   ├── ThemeToggle.jsx
│   │   ├── AuthButton.jsx
│   │   └── QANode.jsx
│   ├── context/           # React context providers
│   │   ├── Auth0Context.jsx
│   │   └── ThemeContext.jsx
│   ├── pages/             # Application pages
│   │   ├── Landing.jsx
│   │   ├── Home.jsx       # Flight Search
│   │   ├── MindMap.jsx
│   │   ├── BMICalculator.jsx
│   │   ├── AfterLogin.jsx
│   │   └── AfterLogout.jsx
│   ├── services/          # API services
│   │   ├── mockFlightApi.js
│   │   └── mockMindMapApi.js
│   ├── lib/               # Utility libraries
│   ├── App.jsx            # Main app component
│   ├── App.css
│   ├── main.jsx           # Application entry point
│   └── index.css
├── dist/                  # Build output directory
├── public/                # Static assets
├── .env                   # Development environment config
├── .env.staging           # Staging environment config
├── .env.prod              # Production environment config
├── vite.config.js         # Vite configuration
├── package.json
└── README.md
```

## Authentication

The app uses Auth0 for authentication:

- **Provider**: Auth0Context wraps the entire application
- **Cache**: localStorage
- **Redirect Pattern**: Hash-based routing
  - Login redirect: `/#/afterlogin`
  - Logout redirect: `/#/afterlogout`

### Authentication Features

- Persistent login state
- Secure token management
- Access token retrieval for API calls
- User profile information

### Usage in Components

```jsx
import { useAuth0 } from './context/Auth0Context';

function MyComponent() {
  const { isAuthenticated, user, login, logout, getAccessToken } = useAuth0();

  // Use authentication state and methods
}
```

## Theming

The app supports light and dark themes:

- **Provider**: ThemeContext
- **Storage**: localStorage (key: `flight-tracker-theme`)
- **Implementation**: CSS variables and `data-theme` attribute
- **Toggle**: ThemeToggle component in the app header

### Theme Persistence

User theme preferences are saved to localStorage and restored on page reload.

## Development Notes

### API Integration

Currently, the app uses mock APIs with simulated delays (500-800ms):
- `src/services/mockFlightApi.js`
- `src/services/mockMindMapApi.js`

To integrate with a real backend:
1. Update environment variables with backend URLs
2. Replace mock API services with actual HTTP calls
3. The Vite dev server proxies `/api/*` to `http://localhost:5000`

### Routing

The app uses **HashRouter** (not BrowserRouter):
- All routes are prefixed with `/#/`
- Enables deployment to static hosting without server-side configuration
- Compatible with GitHub Pages and similar platforms

## Contributing

When contributing to this project:

1. Follow the existing code style
2. Use ESLint for code linting: `npm run lint`
3. Test changes in both light and dark themes
4. Verify responsive design on mobile devices
5. Update this README when adding new features or applications

## License

This project is private and proprietary.
