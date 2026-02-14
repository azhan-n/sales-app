# USDT Tracker

## Overview

USDT Tracker is a mobile-first application for tracking USDT (Tether cryptocurrency) buy/sell transactions. It allows users to record transactions with customer details, card information, buy/sell rates and amounts, and automatically calculates cost, revenue, and profit. The app provides a dashboard with financial summaries, a transaction list with search/filter, and a customer analytics view.

The project uses an Expo React Native frontend with an Express.js backend server, designed to run on Replit with both development and production configurations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend (Expo React Native)
- **Framework**: Expo SDK 54 with React Native 0.81, using expo-router for file-based routing
- **Navigation**: Tab-based layout with 3 tabs (Dashboard, Sales/Transactions, Customers) plus a modal form sheet for adding transactions
- **State Management**: React Context (`TransactionContext`) for transaction data, plus TanStack React Query for API data fetching
- **Data Sources**: Dual data source — Google Sheets via Apps Script API for historical data, plus local AsyncStorage for new transactions added in-app
- **Styling**: Dark-themed UI using a custom color palette (navy/emerald/slate theme) defined in `constants/colors.ts`
- **Fonts**: DM Sans (Google Fonts) loaded via `@expo-google-fonts/dm-sans`
- **Platform Support**: iOS, Android, and Web (with platform-specific adaptations throughout)

### Backend (Express.js)
- **Server**: Express 5 running on the same Replit instance, serves as API backend and static file host for production builds
- **Routes**: Defined in `server/routes.ts` — currently minimal with a placeholder for `/api` prefixed routes
- **Storage**: In-memory storage (`MemStorage` class) for user data, with a Drizzle ORM schema ready for PostgreSQL migration
- **CORS**: Dynamic CORS configuration supporting Replit domains and localhost for development
- **Production**: Static web build served from `dist/` directory via Express

### Database Schema
- **ORM**: Drizzle ORM with PostgreSQL dialect configured via `drizzle.config.ts`
- **Schema**: Located in `shared/schema.ts` — currently has a `users` table with id (UUID), username, and password
- **Validation**: Uses `drizzle-zod` for schema-to-Zod validation (insert schemas)
- **Note**: The database schema is minimal and doesn't yet include transaction tables — transactions are stored in Google Sheets and AsyncStorage

### Data Flow
- **Google Sheets Integration**: Fetches transaction data from a Google Apps Script endpoint (`fetchSheetTransactions` in `lib/storage.ts`). This is a read-only integration that maps spreadsheet rows to Transaction objects.
- **Local Storage**: New transactions created in-app are stored in AsyncStorage under the key `usdt_local_transactions`. The TransactionContext merges both sources.
- **Transaction Model**: Each transaction includes customer name, card info (last 4 digits, type), buy/sell rates and USDT amounts, computed cost/revenue/profit, and a timestamp.

### Build & Deployment
- **Development**: Two processes — `expo:dev` for the Expo dev server and `server:dev` for the Express backend (using tsx)
- **Production Build**: Custom build script (`scripts/build.js`) handles Expo static web export, server is bundled with esbuild
- **Database Migrations**: `drizzle-kit push` for schema sync with PostgreSQL

### Key Design Decisions
1. **Dual data source (Sheets + AsyncStorage)**: Allows reading legacy data from an existing Google Sheet while enabling offline-capable local transaction creation. Trade-off: no single source of truth, potential sync issues.
2. **In-memory server storage**: Simple starting point with `MemStorage`, but Drizzle schema is ready for PostgreSQL. When adding persistent server-side features, switch to database-backed storage.
3. **Context over Redux**: Transaction state uses React Context for simplicity given the relatively small state surface area.
4. **File-based routing**: expo-router provides Next.js-style routing with the `app/` directory structure.

## External Dependencies

### Third-Party Services
- **Google Apps Script**: Read-only API endpoint for fetching transaction data from a Google Sheet (URL hardcoded in `lib/storage.ts`)
- **PostgreSQL**: Configured via `DATABASE_URL` environment variable, used with Drizzle ORM (schema defined but not fully utilized yet)

### Key Libraries
- **Expo SDK 54**: Core mobile framework with plugins for fonts, haptics, image picker, blur effects, linear gradients, etc.
- **TanStack React Query**: Server state management and API data fetching
- **Drizzle ORM + drizzle-zod**: Type-safe database ORM with Zod validation schema generation
- **AsyncStorage**: Local key-value persistence for mobile/web
- **Express 5**: Backend HTTP server
- **http-proxy-middleware**: Used in development for proxying requests
- **react-native-reanimated, react-native-gesture-handler, react-native-screens**: Navigation and animation support
- **expo-haptics**: Tactile feedback on native platforms

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string (required for Drizzle)
- `EXPO_PUBLIC_DOMAIN`: Public domain for API requests from the frontend
- `REPLIT_DEV_DOMAIN`: Replit development domain (used for CORS and Expo configuration)
- `REPLIT_DOMAINS`: Comma-separated production domains for CORS
- `REPLIT_INTERNAL_APP_DOMAIN`: Used during production builds for deployment domain resolution