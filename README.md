# Benefits Assistant Chatbot v2.0

A multi-tenant, AI-powered benefits management platform that transforms employee benefits decisions through conversational AI, visual analytics, and intelligent automation.


## 📦 Project Overview

- Version `3.1.0`
- Firebase/Google Cloud deployment
- Vertex AI as primary model (OpenAI/Claude fallbacks)
- Migration status: PostgreSQL ➜ Firebase


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
- **[Claude Code Execution System](./docs/claude-code-execution-system.md)** - Step-by-step implementation guide
- **[Development Control System](./claude.md)** - Real-time development tracking and verification

## 🏗️ Architecture Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Web Client    │     │  Mobile Client  │     │   API Client    │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                         │
         └───────────────────────┴─────────────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │  Firebase Hosting/CDN   │
                    │     (Auth, Routing)     │
                    └────────────┬────────────┘
                                 │
         ┌───────────────────────┴───────────────────────┐
         │                                               │
    ┌────▼──────┐  ┌──────────────┐  ┌─────────────┐  ┌─▼──────────┐
    │   Chat    │  │   Benefits   │  │  Analytics  │  │   Admin    │
    │ Function  │  │   Function   │  │  Function   │  │  Function  │
    └────┬──────┘  └──────┬───────┘  └──────┬──────┘  └─────┬──────┘
         │               │                   │                │
         └───────────────┴───────────────────┴────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │   AI Orchestration     │
                    │      (Vertex AI)       │
                    └────────────┬────────────┘
                                 │
    ┌────────────┐ ┌──────────────┐ ┌─────────────┐ ┌────────────────────────┐
    │Firebase    │ │Cloud         │ │ Firestore   │ │ Vertex AI Vector Search│
    │Hosting     │ │Functions     │ │ (Database)  │ │ (Vector DB)            │
    └────────────┘ └──────────────┘ └─────────────┘ └────────────────────────┘
```

## 🚦 Quick Start

### Prerequisites
- Node.js >= 20.0.0
- pnpm >= 8.0.0
- Firebase CLI
- Firestore database
- Cloud Storage bucket

### Environment Setup
```bash
# Clone repository
git clone https://github.com/your-org/benefits-chatbot.git
cd benefits-chatbot

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local
# Never commit real `.env` files or secrets to version control.

# Required environment variables:
FIREBASE_PROJECT_ID=       # Firebase project identifier
FIREBASE_CLIENT_EMAIL=     # Service account client email
FIREBASE_PRIVATE_KEY=      # Base64-encoded private key

```

#### Google Cloud Setup

To use Firestore and Vertex AI features:

1. Enable the Firestore, Vertex AI, and Document AI APIs in your Google Cloud project.
2. Create a Vertex AI index and endpoint, and note their IDs.
3. Create a Document AI processor for the documents you need to process.
4. Grant your service account the following IAM roles:
   - Vertex AI User (`roles/aiplatform.user`)
   - Document AI Editor (`roles/documentai.editor`)
5. Add the following variables to your `.env.local` file:
   - `GOOGLE_CLOUD_PROJECT`
   - `GOOGLE_CLOUD_LOCATION`
   - `VERTEX_AI_PROJECT_ID`
   - `VERTEX_AI_LOCATION`
   - `VERTEX_AI_INDEX_ID`
   - `VERTEX_AI_INDEX_ENDPOINT_ID`
   - `DOCUMENT_AI_PROCESSOR_ID`


## Quick Start Commands

### Development
```bash
# Install dependencies
pnpm install

# Start development server
pnpm run dev

# Start Firebase emulators
firebase emulators:start
```

### Build & Testing
```bash
# Build application
pnpm run build

# Type checking
pnpm run typecheck

# Run tests
pnpm test

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

## 📁 Project Structure

```
benefits-chatbot/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   ├── (chat)/            # Chat interface
│   ├── api/               # API routes
│   └── provider/          # Provider admin portal
├── components/            # React components
│   ├── custom/            # Business-specific components
│   └── ui/                # shadcn/ui components
├── lib/                   # Core business logic
│   ├── ai/                # AI tools and prompts
│   │   ├── tools/         # AI function tools
│   │   ├── prompts/       # System prompts
│   │   └── context/       # Context management
│   ├── db/                # Database layer
│   │   ├── schema/        # Database schemas
│   │   ├── repositories/  # Data access layer
│   │   └── converters/    # Firestore converters and utilities
│   └── utils/             # Utility functions
├── public/                # Static assets
├── scripts/               # Build and maintenance scripts
├── tests/                 # Test files
├── docs/                  # Documentation
└── claude.md              # Development tracking
```

## 🔐 Security

### Authentication & Authorization
- **Provider Admin**: Full platform access
- **Employer Admin**: Company-specific access
- **Employee**: Personal benefits access only

### Data Protection
- End-to-end encryption (TLS 1.3)
- Encrypted environment variables
- No PII/PHI storage in logs

### Compliance
- GDPR-ready data handling
- CCPA compliance features
- SOC 2 Type II practices
- HIPAA-ready architecture

## 🤝 Contributing

### Development Workflow
1. Review [claude.md](./claude.md) for current status
2. Pick a task from the roadmap
3. Create a feature branch
4. Implement with proof-of-work
5. Update claude.md with evidence
6. Submit PR with verification

### Code Standards
- TypeScript strict mode
- No `any` without TODO
- 80%+ test coverage
- All PRs must pass CI

### CI Test Process
Our GitHub Actions pipeline runs `npm test` with coverage on every push and pull request. The build fails if any test fails or if coverage falls below the configured thresholds (lines: 80%, statements: 80%, functions: 80%, branches: 15%). Run `npm test` locally before pushing to verify your changes.

### Using with Windsurf/Cascade
When using AI coding assistants:
1. Always provide full context from claude.md
2. Verify generated code against our patterns
3. Run verification suite before committing
4. Document any deviations in claude.md

## 📊 Monitoring & Analytics

### Production Monitoring
- **Error Tracking**: Sentry (to be configured)
- **AI Metrics**: Token usage, response times
- **Business Metrics**: Custom analytics dashboard

### Health Checks
- `/api/health` - System health
- `/api/health/db` - Database connectivity
- `/api/health/ai` - AI service availability

## 🆘 Troubleshooting

### Common Issues

#### Build Failures
```bash
# Clear cache
rm -rf .next
pnpm install --force
pnpm build
```

#### Type Errors
```bash
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

**Note**: This is an active development project. 