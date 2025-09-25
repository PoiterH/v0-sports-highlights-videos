# Claude.md - TypeScript Starter Project

## Project Overview

This TypeScript starter project provides a foundation for building modern JavaScript applications with type safety. The codebase follows industry best practices for maintainability, testing, and development workflow.

## Key Technologies

- **TypeScript**: Primary language for type-safe development
- **Node.js**: Runtime environment
- **npm/yarn**: Package management
- **Jest**: Testing framework
- **ESLint**: Code linting
- **Prettier**: Code formatting

## Project Structure

```
src/
├── components/          # Reusable components
├── services/           # Business logic and API calls
├── types/              # TypeScript type definitions
├── utils/              # Helper functions
├── config/             # Configuration files
└── tests/              # Test files
```

## Development Guidelines

### Code Style
- Use descriptive variable and function names
- Prefer `const` over `let` when possible
- Use arrow functions for short, single-purpose functions
- Keep functions small and focused on single responsibilities

### Type Safety
- Define interfaces for all data structures
- Use union types for flexible but controlled options
- Avoid `any` type - use `unknown` or specific types instead
- Create custom type guards for runtime type checking

### Error Handling
- Use proper error boundaries and try-catch blocks
- Create custom error classes for different error types
- Log errors with context for debugging
- Provide meaningful error messages to users

## Common Patterns

### API Service Example
```typescript
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

class ApiService {
  private baseUrl: string;
  
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }
  
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    // Implementation here
  }
}
```

### Configuration Management
- Store environment variables in `.env` files
- Use a config service to centralize settings
- Validate configuration on startup
- Separate configs for development, staging, and production

## Working with Claude

### When to Ask for Help
- Refactoring complex functions
- Writing comprehensive tests
- Debugging TypeScript compilation errors
- Optimizing performance bottlenecks
- Creating new architectural patterns

### Providing Context
When asking Claude for assistance, include:
- Relevant code snippets
- Error messages or logs
- Expected vs actual behavior
- Your current TypeScript configuration
- Dependencies and versions

### Code Review Requests
Ask Claude to review code for:
- Type safety improvements
- Performance optimizations
- Security vulnerabilities
- Code maintainability
- Testing coverage gaps

## Testing Strategy

### Unit Tests
- Test individual functions and classes
- Mock external dependencies
- Use descriptive test names
- Aim for high code coverage

### Integration Tests
- Test component interactions
- Verify API endpoints
- Test database operations
- Validate configuration loading

### Test Structure Example
```typescript
describe('UserService', () => {
  beforeEach(() => {
    // Setup code
  });
  
  it('should create user with valid data', async () => {
    // Test implementation
  });
  
  it('should throw error with invalid email', async () => {
    // Test implementation
  });
});
```

## Performance Considerations

### Code Optimization
- Use lazy loading for large modules
- Implement proper caching strategies
- Optimize bundle sizes
- Profile memory usage regularly

### Build Optimization
- Configure tree shaking
- Use code splitting
- Minimize dependencies
- Optimize TypeScript compilation

## Deployment Checklist

- [ ] All tests passing
- [ ] No TypeScript compilation errors
- [ ] ESLint rules satisfied
- [ ] Environment variables configured
- [ ] Build artifacts generated
- [ ] Performance benchmarks met
- [ ] Security scan completed

## Troubleshooting Common Issues

### TypeScript Errors
- Check tsconfig.json configuration
- Verify import paths and module resolution
- Update type definitions
- Clear node_modules and reinstall

### Runtime Errors
- Check environment variables
- Verify API endpoints
- Review error logs
- Test with different data inputs

### Build Issues
- Clear build cache
- Update dependencies
- Check file permissions
- Verify build scripts

## Getting Started Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Lint code
npm run lint

# Format code
npm run format
```

## Additional Resources

- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [Jest Testing Framework](https://jestjs.io/docs/getting-started)

---

*This file should be updated as the project evolves and new patterns emerge.*