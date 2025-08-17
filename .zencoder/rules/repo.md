---
description: Repository Information Overview
alwaysApply: true
---

# Ezz Information

## Summary
Ezz is an Angular-based e-commerce application that provides product browsing, shopping cart functionality, user authentication, and an admin dashboard for managing products, categories, users, and orders. The application uses Angular 19 and includes features like JWT authentication, lazy-loaded components, and integration with a backend API.

## Structure
- **src/**: Main source code directory containing application components, services, and assets
  - **app/**: Angular application code with components, services, guards, and interceptors
  - **assets/**: Static assets including images and icons
  - **environments/**: Environment configuration files
- **dist/**: Build output directory for compiled application
- **public/**: Public assets including favicon and logo

## Language & Runtime
**Language**: TypeScript
**Version**: TypeScript 5.7.2
**Framework**: Angular 19.2.0
**Build System**: Angular CLI 19.2.3
**Package Manager**: npm

## Dependencies
**Main Dependencies**:
- Angular core packages (^19.2.0)
- Angular Material (^19.2.0)
- @auth0/angular-jwt (^5.2.0)
- ngx-toastr (^19.0.0)
- rxjs (~7.8.0)
- zone.js (~0.15.0)

**Development Dependencies**:
- @angular-devkit/build-angular (^19.2.3)
- @angular/cli (^19.2.3)
- Jasmine and Karma for testing

## Build & Installation
```bash
# Install dependencies
npm install

# Start development server with API proxy
npm start

# Build for production
npm run build
```

## Application Structure
**Entry Point**: src/main.ts bootstraps the AppComponent with configuration from app.config.ts
**Routing**: Configured in app.routes.ts with lazy-loaded components for better performance
**API Integration**: Uses HttpClient with auth interceptor for backend communication
**Authentication**: JWT-based authentication with guards for protected routes
**Features**:
- Product browsing and filtering
- Shopping cart and checkout
- User registration and authentication
- Admin dashboard for content management
- Order tracking and management

## Testing
**Framework**: Karma and Jasmine
**Test Location**: Spec files alongside components
**Configuration**: tsconfig.spec.json and karma configuration in angular.json
**Run Command**:
```bash
npm test
```

## Backend Integration
**API Proxy**: Configured in proxy.conf.json to forward requests to backend server
**Endpoints**:
- API requests proxied to https://localhost:7249/api
- File uploads proxied to https://localhost:7249/uploads