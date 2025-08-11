# Homecare Booking Service

A modern, full-stack homecare booking service built with React, Vite, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Modern Tech Stack**: React 18, Vite, TypeScript, Tailwind CSS
- **Full-Stack**: Express.js backend with JSON Server for development
- **Type Safety**: Comprehensive TypeScript configuration with strict mode
- **Code Quality**: ESLint, Prettier, and Husky for pre-commit hooks
- **Testing**: Vitest with React Testing Library for comprehensive testing
- **Performance**: Bundle optimization and code splitting
- **Security**: Regular dependency audits and security scanning

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with concurrent features
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **React Query** - Server state management
- **React Hook Form** - Performant forms with validation
- **Zod** - Runtime validation schemas

### Backend
- **Express.js** - Node.js web framework
- **JSON Server** - Mock API for development
- **CORS** - Cross-origin resource sharing

### Development Tools
- **ESLint** - Code linting and quality
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **Vitest** - Unit testing framework
- **TypeScript** - Static type checking

## 📋 Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 8.0.0

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set up Git Hooks

```bash
npm run prepare
```

### 3. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### 4. Start Backend Server (Optional)

```bash
npm run server
```

JSON Server will be available at `http://localhost:3001`

## 📜 Available Scripts

### Development
- `npm run dev` - Start Vite dev server
- `npm run server` - Start JSON Server
- `npm run start` - Start both frontend and backend

### Building
- `npm run build` - Build for production
- `npm run build:analyze` - Build with bundle analysis
- `npm run preview` - Preview production build

### Code Quality
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run type-check` - Run TypeScript type checking

### Testing
- `npm run test` - Run tests
- `npm run test:coverage` - Run tests with coverage
- `npm run test:ui` - Run tests with UI

### Maintenance
- `npm run clean` - Clean build artifacts
- `npm run deps:update` - Update dependencies
- `npm run security:audit` - Security audit
- `npm run security:fix` - Fix security issues

## 🧪 Testing

The project uses Vitest with React Testing Library for comprehensive testing:

```bash
# Run all tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui
```

### Test Structure
- Tests are co-located with components
- Use `@testing-library/react` for component testing
- Mock common browser APIs in `src/test/setup.ts`

## 🔧 Configuration Files

- **`.prettierrc`** - Prettier formatting rules
- **`vitest.config.ts`** - Vitest testing configuration
- **`tsconfig.json`** - TypeScript configuration
- **`vite.config.ts`** - Vite build configuration
- **`.husky/pre-commit`** - Git pre-commit hooks

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── admin/          # Admin-specific components
│   └── common/         # Shared components
├── contexts/           # React contexts
├── data/               # Mock data and schemas
├── pages/              # Page components
│   ├── admin/          # Admin pages
│   └── customer/       # Customer pages
├── services/           # API services
├── test/               # Test setup and utilities
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── main.jsx            # Application entry point
```

## 🚀 Deployment

### Netlify (Recommended)
The project includes `netlify.toml` for easy deployment to Netlify.

### Manual Build
```bash
npm run build
npm run preview
```

## 🔒 Security

- Regular dependency audits with `npm audit`
- Automated security fixes
- Type-safe API calls
- Input validation with Zod schemas

## 📊 Performance

- Code splitting with Vite
- Bundle analysis capabilities
- Optimized imports and tree shaking
- Tailwind CSS purging for production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📝 License

This project is private and proprietary.

## 🆘 Support

For support and questions, please contact the development team.

---

**Built with ❤️ using modern web technologies**
