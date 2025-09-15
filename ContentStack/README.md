# Locale Variants Manager - Contentstack Marketplace App

A comprehensive Contentstack Marketplace app for managing multilingual content using variant groups and AI-powered fallback logic. Built with React frontend and Node.js backend, integrating with Contentstack CMS, Personalize API, and multiple AI translation services.

## 🌟 Features

### Core Functionality

- **Variant Group Management**: Create and manage locale groups with fallback hierarchies
- **AI-Powered Translations**: Support for OpenAI, Groq, Google Translate, and DeepL
- **Entry Sidebar Extension**: Manage variants directly from Contentstack entries
- **Fallback Logic**: Automatic content resolution with configurable fallback chains
- **Bulk Operations**: Create variants and translations for multiple entries
- **Real-time Updates**: Webhook integration for automatic variant management

### Supported AI Providers

- **OpenAI GPT**: High-quality, context-aware translations
- **Groq (Llama)**: Fast, cost-effective translations
- **Google Translate**: 100+ languages, reliable service
- **DeepL**: High-quality European language translations

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Client  │    │   Node.js API   │    │  Contentstack   │
│                 │◄──►│                 │◄──►│                 │
│  - Dashboard    │    │  - Express      │    │  - CMS API      │
│  - Variant UI   │    │  - Controllers  │    │  - Management   │
│  - Sidebar      │    │  - Services     │    │  - Personalize  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   AI Services   │
                       │                 │
                       │  - OpenAI       │
                       │  - Groq         │
                       │  - Google       │
                       │  - DeepL        │
                       └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Contentstack account with API access
- Personalize API access
- AI service API keys (optional)

### Installation

1. **Clone and Install Dependencies**

   ```bash
   git clone <repository-url>
   cd ContentStack
   npm run install:all
   ```

2. **Environment Configuration**

   ```bash
   # Copy environment files
   cp server/env.example server/.env
   cp client/env.example client/.env

   # Edit server/.env with your credentials
   CONTENTSTACK_API_KEY=your_stack_api_key
   CONTENTSTACK_MANAGEMENT_TOKEN=your_management_token
   PERSONALIZE_API_KEY=your_personalize_api_key
   OPENAI_API_KEY=your_openai_api_key  # Optional
   GROQ_API_KEY=your_groq_api_key      # Optional
   ```

3. **Start Development Servers**

   ```bash
   # Start both frontend and backend
   npm run dev

   # Or start individually
   npm run dev:server  # Backend on :3001
   npm run dev:client  # Frontend on :3000
   ```

4. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - Health Check: http://localhost:3001/health

## 📁 Project Structure

```
ContentStack/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── services/      # API services
│   │   ├── styles/       # Styled components theme
│   │   ├── types/        # TypeScript types
│   │   └── utils/        # Utility functions
│   ├── package.json
│   └── vite.config.ts
├── server/                # Node.js backend
│   ├── src/
│   │   ├── controllers/  # API route handlers
│   │   ├── services/     # Business logic
│   │   ├── middleware/   # Express middleware
│   │   ├── types/       # TypeScript types
│   │   └── utils/       # Utility functions
│   ├── package.json
│   └── tsconfig.json
├── manifest.json         # Contentstack app manifest
└── README.md
```

## 🔧 Configuration

### Contentstack Setup

1. **Stack Configuration**

   - API Key: Your Contentstack stack API key
   - Management Token: Token with content management permissions
   - Environment: Target environment (development/production)

2. **Personalize API**
   - API Key: Personalize API key for variant storage
   - Project ID: Personalize project identifier

### AI Translation Services

Configure one or more AI providers in your environment:

```env
# OpenAI (Recommended)
OPENAI_API_KEY=sk-...

# Groq (Fast & Cost-effective)
GROQ_API_KEY=gsk_...

# Google Translate
GOOGLE_TRANSLATE_API_KEY=...

# DeepL (European languages)
DEEPL_API_KEY=...
```

## 📖 Usage Guide

### 1. Creating Variant Groups

1. Navigate to **Variant Manager**
2. Click **Create New Group**
3. Define locales and fallback chains
4. Save and activate the group

### 2. Managing Entry Variants

1. Open any Contentstack entry
2. Access the **Locale Variants** sidebar
3. View existing variants and missing translations
4. Generate AI translations or create manually

### 3. Bulk Operations

1. Select multiple entries
2. Choose target locales
3. Configure AI translation settings
4. Execute bulk variant creation

### 4. Fallback Configuration

```javascript
// Example fallback chain
{
  "locales": [
    {
      "code": "mr",
      "name": "Marathi",
      "fallback": ["hi", "en"]
    },
    {
      "code": "hi",
      "name": "Hindi",
      "fallback": ["en"]
    },
    {
      "code": "en",
      "name": "English",
      "isDefault": true
    }
  ]
}
```

## 🔌 API Endpoints

### Variant Management

- `GET /api/variants/groups` - List variant groups
- `POST /api/variants/groups` - Create variant group
- `PUT /api/variants/groups/:id` - Update variant group
- `DELETE /api/variants/groups/:id` - Delete variant group

### Translation Services

- `POST /api/translations/translate` - Translate content
- `POST /api/translations/batch` - Batch translate
- `POST /api/translations/detect-language` - Detect language
- `GET /api/translations/providers` - List AI providers

### Contentstack Integration

- `GET /api/contentstack/content-types` - List content types
- `GET /api/contentstack/entries/:type` - List entries
- `PUT /api/contentstack/entries/:type/:id` - Update entry
- `POST /api/contentstack/entries/:type/:id/publish` - Publish entry

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test suites
npm test -- --testPathPattern=server
npm test -- --testPathPattern=client
```

## 🚀 Deployment

### Development

```bash
npm run build
npm start
```

### Production

1. **Build Applications**

   ```bash
   npm run build
   ```

2. **Environment Variables**

   - Set production environment variables
   - Configure CORS origins
   - Set up SSL certificates

3. **Deploy to Platform**
   - Heroku, Vercel, AWS, or your preferred platform
   - Configure webhook URLs
   - Set up monitoring

### Contentstack Marketplace Submission

1. **Prepare App Package**

   - Complete `manifest.json`
   - Add screenshots and documentation
   - Test all functionality

2. **Submit for Review**
   - Follow Contentstack submission guidelines
   - Provide demo credentials
   - Respond to feedback

## 🔒 Security Considerations

- **API Keys**: Store securely, never commit to version control
- **CORS**: Configure appropriate origins
- **Rate Limiting**: Implement request throttling
- **Validation**: Validate all inputs and API responses
- **Authentication**: Implement proper user authentication

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- **Documentation**: [Contentstack Docs](https://www.contentstack.com/docs)
- **API Reference**: [Personalize API](https://www.contentstack.com/docs/developers/apis/personalize-management-api)
- **Issues**: Create GitHub issues for bugs and feature requests
- **Community**: Join the Contentstack community forums

## 🎯 Roadmap

- [ ] Vector search integration for content similarity
- [ ] Advanced AI agent workflows
- [ ] Real-time collaboration features
- [ ] Advanced analytics and reporting
- [ ] Multi-tenant support
- [ ] Plugin architecture for custom providers

---

Built with ❤️ for the Contentstack community
