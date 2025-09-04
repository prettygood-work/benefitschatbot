# Benefits Assistant Chatbot v2.0

A multi-tenant, AI-powered benefits management platform that transforms employee benefits decisions through conversational AI, visual analytics, and intelligent automation.

## 🚀 Current Status

**Version**: MVP (Single-tenant)  
**Stack**: Next.js 15, TypeScript, Drizzle ORM, Neon PostgreSQL, Vercel AI SDK  
**Deployment**: Vercel (Production)  
**AI Model**: xAI Grok-2 (with OpenAI GPT-4 fallback ready)

### ✅ Completed Features
- Basic conversational AI with benefits personality
- Visual components:
  - Plan comparison cards
  - Benefits dashboard
  - Interactive cost calculator
- AI tools (currently using mock data):
  - `comparePlans`
  - `calculateBenefitsCost`
  - `showBenefitsDashboard`
  - `showCostCalculator`
- Basic authentication (NextAuth)
- Chat history persistence
- Responsive design

### 🚧 In Development
- Multi-tenant database schema
- Real data integration
- Document processing
- Knowledge base
- Admin portals (Employer & Provider)
- SSO integration
- Analytics engine

## 📚 Documentation

### Core Documents
- **[Technical Specification v2.0](./docs/tech-spec-v2.md)** - Complete technical architecture
- **[Product Requirements Document](./docs/prd-v2.md)** - Business requirements and success metrics
- **[System Architecture](./docs/architecture-v2.md)** - Detailed system design with Tree-of-Thought analysis
- **[Product Blueprint](./docs/blueprint-v2.md)** - Vision, personas, and non-functional requirements
- **[Style Guide](./docs/style-guide-v2.md)** - Design system and UI standards
- **[Development Roadmap](./docs/roadmap-v2.md)** - 18-week phased implementation plan

## 🏗️ Architecture Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Web Client    │     │  Mobile Client  │     │   API Client    │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                         │
         └───────────────────────┴─────────────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │    Vercel Edge/CDN      │
                    │  (Auth, Rate Limiting)  │
                    └────────────┬────────────┘
                                 │
         ┌───────────────────────┴───────────────────────┐
         │                                               │
    ┌────▼─────┐  ┌──────────────┐  ┌─────────────┐  ┌─▼──────────┐
    │   Chat   │  │   Benefits   │  │  Analytics  │  │   Admin    │
    │  Service │  │   Service    │  │   Service   │  │  Service   │
    └────┬─────┘  └──────┬───────┘  └──────┬──────┘  └─────┬──────┘
         │               │                   │                │
         └───────────────┴───────────────────┴────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │    AI Orchestration     │
                    │  (Multi-Model Routing)  │
                    └────────────┬────────────┘
                                 │
         ┌───────────────────────┴───────────────────────┐
         │                       │                       │
    ┌────▼─────┐         ┌──────▼───────┐      ┌───────▼──────┐
    │PostgreSQL│         │   Pinecone    │      │    Redis     │
    │  (Neon)  │         │ (Vector DB)   │      │   (Cache)    │
    └──────────┘         └──────────────┘      └──────────────┘
```

## 🚦 Quick Start

### Prerequisites
- Node.js >= 20.0.0
- pnpm >= 8.0.0
- PostgreSQL (via Neon)
- Vercel CLI (for deployment)

### Environment Setup
```bash
# Clone repository
git clone https://github.com/your-org/benefits-chatbot.git
cd benefits-chatbot

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local

# Required environment variables:
POSTGRES_URL=              # Neon PostgreSQL URL
POSTGRES_URL_NON_POOLING=  # Neon direct connection
AUTH_SECRET=               # NextAuth secret (generate with: openssl rand -base64 32)
OPENAI_API_KEY=            # For GPT-4 fallback
XAI_API_KEY=               # For Grok-2 (primary)
```

### Development
```bash
# Run database migrations
pnpm db:migrate

# Start development server
pnpm dev

# Run tests
pnpm test

# Check types
pnpm tsc --noEmit

# Lint and format
pnpm lint:fix
pnpm format
```

### Database Management
```bash
# Generate migration
pnpm db:generate

# Run migrations
pnpm db:migrate

# Open Drizzle Studio
pnpm db:studio

# Push schema changes (dev only)
pnpm db:push
```

## 🧪 Testing Strategy

### Unit Tests
```bash
pnpm test:unit          # Run unit tests
pnpm test:unit:watch    # Watch mode
pnpm test:unit:coverage # With coverage
```

### Integration Tests
```bash
pnpm test:integration   # Run integration tests
pnpm test:e2e           # Run E2E tests with Playwright
```

### Verification Suite
```bash
# Run complete verification before committing
./scripts/verify.sh

# This runs:
# - Type checking
# - Linting
# - Tests
# - Build verification
# - Security audit
```

## 🚀 Deployment

### Vercel Deployment (Production)
```bash
# Deploy to production
vercel --prod

# Deploy to preview
vercel

# Check deployment status
vercel ls
```

### Environment Configuration
- **Development**: Local PostgreSQL, development API keys
- **Staging**: Neon PostgreSQL (staging), test API keys
- **Production**: Neon PostgreSQL (production), production API keys

## 📁 Project Structure

```
benefits-chatbot/
├── src/                 # Application sources
│   ├── app/            # Next.js App Router
│   ├── components/     # React components
│   ├── config/         # Configuration modules
│   ├── context/        # React context providers
│   ├── dataconnect/    # Data connectors
│   ├── hooks/          # Custom hooks
│   ├── lib/            # Core business logic
│   └── types/          # Type definitions
├── public/             # Static assets
├── scripts/            # Build and maintenance scripts
├── tests/              # Test files
└── docs/               # Documentation
```

## 🔐 Security

### Authentication & Authorization
- **Provider Admin**: Full platform access
- **Employer Admin**: Company-specific access
- **Employee**: Personal benefits access only

### Data Protection
- End-to-end encryption (TLS 1.3)
- Row-level security in PostgreSQL
- Encrypted environment variables
- No PII/PHI storage in logs

### Compliance
- GDPR-ready data handling
- CCPA compliance features
- SOC 2 Type II practices
- HIPAA-ready architecture

## 🤝 Contributing

### Development Workflow
2. Pick a task from the roadmap
3. Create a feature branch
4. Implement with proof-of-work
6. Submit PR with verification

### Code Standards
- TypeScript strict mode
- No `any` without TODO
- 80%+ test coverage
- All PRs must pass CI

### Using with Windsurf/Cascade
When using AI coding assistants:
2. Verify generated code against our patterns
3. Run verification suite before committing

## 📊 Monitoring & Analytics

### Production Monitoring
- **Vercel Analytics**: Page views, Web Vitals
- **Error Tracking**: Sentry (to be configured)
- **AI Metrics**: Token usage, response times
- **Business Metrics**: Custom analytics dashboard

### Health Checks
- `/api/health` - System health
- `/api/health/db` - Database connectivity
- `/api/health/ai` - AI service availability

## 🆘 Troubleshooting

### Common Issues

#### Database Connection Errors
```bash
# Check connection
pnpm exec tsx scripts/check-db.ts

# Reset connection pool
pnpm db:push --force
```

#### Build Failures
```bash
# Clear cache
rm -rf .next
pnpm install --force
pnpm build
```

#### Type Errors
```bash
# Regenerate types
pnpm db:generate
pnpm tsc --noEmit
```

## 📞 Support

### Development Team
- **Technical Issues**: Create GitHub issue
- **Security Concerns**: security@company.com
- **Business Questions**: product@company.com

### Resources
- [Internal Wiki](./docs/wiki)
- [API Documentation](./docs/api)
- [Deployment Guide](./docs/deployment)

## 📄 License

Proprietary - All rights reserved

---

**Note**: This is an active development project. Always check [roadmap-v2.md](./docs/roadmap-v2.md) for upcoming features.
