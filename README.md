# Velox

An AI-powered content generation SaaS built with Next.js 16, featuring multiple AI tools, chat history, subscription plans, and usage quota management.

🔗 **Live Demo:**(https://ai-app-nine-mauve.vercel.app)

## Features

- 🤖 Multiple AI tools (Text Generator, Code, Captions)
- 💬 Persistent chat history with auto-generated titles
- 👤 Guest mode — use without signing in
- 🔐 Authentication with Clerk (Google + Email)
- 💳 Subscription plans with Clerk Billing
- 📊 Usage quota tracking per plan with monthly reset
- 🔔 Real-time quota bar with upgrade prompts
- 📱 Responsive design with collapsible sidebar
- ✨ Smooth animations with Framer Motion
- 🌙 Dark themed UI

## Plans

| Plan       | Messages/Month |
| ---------- | -------------- |
| Free       | 1,000          |
| Pro        | 2,000          |
| Enterprise | Unlimited      |

## Tech Stack

**Frontend**

- Next.js 16 (App Router, Turbopack)
- TypeScript
- Tailwind CSS
- Framer Motion
- Lucide React
- Sonner (toasts)

**Backend**

- Prisma ORM v7
- PostgreSQL (Neon)
- OpenAI API
- Clerk (Authentication + Billing)
- Resend (Email)

**Deployment**

- Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (Neon recommended)
- Clerk account with Billing enabled
- OpenAI API key
- Resend account

### Installation

1. Clone the repository:

```bash
git clone https://github.com/YOUR_USERNAME/velox-ai.git
cd velox-ai
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables — create a `.env` file:

```env
DATABASE_URL=
DIRECT_URL=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
OPENAI_API_KEY=
RESEND_API_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. Run database migrations:

```bash
npx prisma migrate dev
```

5. Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

src/
├── app/
│ ├── (auth)/ # Sign in & Sign up pages
│ ├── account/ # Account settings
│ ├── plans/ # Pricing & subscription page
│ └── page.tsx # Main chat interface
├── components/ # Reusable components
│ ├── Layout.tsx # App shell with sidebar
│ ├── PromptBox.tsx # Message input
│ ├── ResultPanel.tsx # Chat messages display
│ ├── History.tsx # Chat history sidebar
│ └── QuotaBar.tsx # Usage quota display
├── services/
│ └── chatService.ts # API call helpers
├── lib/
│ ├── chat-server.ts # Server-side chat utilities
│ ├── openai.ts # OpenAI client
│ ├── prisma.ts # Prisma client
│ └── chat-types.ts # TypeScript types
└── utils/
└── fetchHelpers.ts # Fetch utilities

## Database Schema

- **User** — Clerk user with quota tracking and plan info
- **Chat** — Conversation with title and tool selection
- **Message** — Individual messages with role (user/assistant)
- **History** — Generation history for logged in users

## License

MIT
