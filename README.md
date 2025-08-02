# 🧠 GeoFora

**AI-Powered Forum Platform for SEO-Driven Content Creation**

GeoFora is a comprehensive platform that combines forum functionality with AI-powered content creation, SEO optimization, and lead capture capabilities. Built for businesses and content creators who want to leverage community-driven content for search engine visibility and lead generation.

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

---

## ✨ Features

### 💬 **Forum Management**
- Create and manage multiple forums
- Organize content with categories
- User roles and permissions
- Real-time Q&A functionality

### 🤖 **AI-Powered Content**
- AI-generated questions and answers
- Smart content suggestions
- SEO-optimized content creation
- Multiple AI personas

### 📊 **Analytics & SEO**
- Comprehensive traffic analytics
- SEO performance tracking
- Keyword analysis
- Content interlinking suggestions

### 🎯 **Lead Capture**
- Custom lead capture forms
- Gated content functionality
- CRM integrations
- Lead analytics and reporting

### 🔗 **Integrations**
- Clerk authentication
- OpenAI API integration
- Webhook support
- RESTful API

---

## 🚀 Quick Deploy to Render

**1-Click Deployment:**

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

**Or follow the detailed deployment guide:** [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## 🛠️ Tech Stack

### **Frontend**
- **React 18** - Modern UI framework
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible components
- **React Query** - Data fetching & caching

### **Backend**
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Type-safe server code
- **Drizzle ORM** - Type-safe database queries

### **Database & Auth**
- **Neon PostgreSQL** - Serverless database
- **Clerk** - Authentication & user management

### **AI & Services**
- **OpenAI API** - AI content generation
- **RESTful APIs** - External integrations

---

## 🏃‍♂️ Local Development

### **Prerequisites**
- Node.js 18+ 
- npm or yarn
- PostgreSQL database (local or Neon)

### **Setup**

1. **Clone the repository**
   ```bash
   git clone https://github.com/weblisite/geofora.git
cd geofora
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.template .env
   # Edit .env with your actual values
   ```

4. **Set up database**
   ```bash
   npm run db:push
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

Visit `http://localhost:4000` to see your application running.

---

## 📝 Environment Variables

See `env.template` for all available environment variables.

**Required Variables:**
```bash
DATABASE_URL=postgresql://...
CLERK_SECRET_KEY=sk_test_...
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
OPENAI_API_KEY=sk-...
```

---

## 🏗️ Project Structure

```
geofora/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utilities and configurations
├── server/                 # Backend Express application
│   ├── routes.ts           # API route definitions
│   ├── storage.ts          # Data access interface
│   ├── postgres-storage.ts # PostgreSQL implementation
│   └── analytics.ts        # Analytics functions
├── shared/                 # Shared types and schemas
│   └── schema.ts           # Database schema (Drizzle)
├── render.yaml            # Render deployment config
└── DEPLOYMENT.md          # Deployment guide
```

---

## 🔌 API Endpoints

The platform provides a comprehensive REST API:

- **Forums**: `/api/forums/*`
- **Questions**: `/api/questions/*`
- **Answers**: `/api/answers/*`
- **Users**: `/api/users/*`
- **Analytics**: `/api/analytics/*`
- **Lead Capture**: `/api/lead-forms/*`
- **AI Features**: `/api/ai/*`

Full API documentation available at: `/api/integration/resources`

---

## 🚀 Deployment

### **Render (Recommended)**

1. **Fork this repository** to your GitHub account

2. **Connect to Render**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New +" → "Blueprint"
   - Select your forked repository

3. **Configure Environment Variables**
   - Set all required environment variables
   - Render will create the database automatically

4. **Deploy**
   - Render will build and deploy automatically
   - Your app will be available at `https://yourapp.onrender.com`

**Detailed deployment guide:** [DEPLOYMENT.md](./DEPLOYMENT.md)

### **Other Platforms**

The application can be deployed to any platform that supports Node.js:
- Vercel
- Railway
- Heroku
- DigitalOcean App Platform

---

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🆘 Support

- **Documentation**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Issues**: [GitHub Issues](https://github.com/weblisite/geofora/issues)
- **Discussions**: [GitHub Discussions](https://github.com/weblisite/geofora/discussions)

---

## 🎯 Roadmap

- [ ] Advanced AI content generation
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Enhanced CRM integrations
- [ ] White-label solutions

---

**Made with ❤️ for the developer community**