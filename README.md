# Luminar - Web3.5 Game

A Web3.5 game where players solve clues to reveal fragments that combine into chapter codes. The first 10 users to submit correct codes can claim equal shares of SOL rewards.

## Architecture

- **Frontend**: Next.js on Vercel
- **Backend**: Express on Railway  
- **Database**: Supabase (Postgres + Realtime + Storage)
- **Authentication**: Privy (email + embedded wallets)
- **Bot Protection**: Cloudflare Turnstile
- **Payouts**: Solana (server-side multisend)

## Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd luminar
npm install
```

### 2. Environment Setup

Copy the example environment files and fill in your credentials:

```bash
# Root environment
cp .env.example .env

# Frontend environment  
cp apps/web/.env.local.example apps/web/.env.local

# Backend environment
cp apps/api/.env.example apps/api/.env
```

### 3. Database Setup

1. Create a Supabase project at https://supabase.com
2. Run the database schema from the PRD (see `docs/database-schema.sql`)
3. Set up RLS policies and realtime subscriptions

### 4. Development

```bash
# Start all services
npm run dev

# Or start individually
npm run dev --workspace=@luminar/web    # Frontend on :3000
npm run dev --workspace=@luminar/api    # Backend on :3001
```

### 5. Production Deployment

#### Frontend (Vercel)
1. Connect your GitHub repo to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main

#### Backend (Railway)
1. Connect your GitHub repo to Railway
2. Set environment variables in Railway dashboard
3. Deploy automatically on push to main

## Project Structure

```
luminar/
├── apps/
│   ├── web/                 # Next.js frontend
│   │   ├── app/            # App router pages
│   │   ├── components/     # React components
│   │   └── styles/         # CSS and styling
│   └── api/                # Express backend
│       ├── src/
│       │   ├── routes/     # API route handlers
│       │   ├── middleware/ # Auth, validation, etc.
│       │   ├── services/   # Supabase, Solana, etc.
│       │   └── utils/      # Helper functions
├── packages/               # Shared packages (future)
└── docs/                  # Documentation
```

## Key Features

### Game Flow
1. **Authentication**: Players connect via Privy (email + embedded wallet)
2. **Clue Solving**: 3 clues per chapter, each reveals a fragment
3. **Qualification**: First 10 players to solve all clues qualify
4. **Claiming**: Winners claim SOL rewards to any Solana address

### Security
- **Privy Token Verification**: All API requests authenticated
- **Turnstile Bot Protection**: Server-side verification on mutating routes
- **Atomic Qualification**: Database transactions ensure fair ranking
- **Cooldown System**: 10-second cooldown on wrong answers

### Real-time Updates
- **Slots Ticker**: Live countdown of remaining winner slots
- **Supabase Realtime**: WebSocket updates for game state

## API Endpoints

### Clues
- `POST /v1/clues/:id/submit` - Submit clue answer

### Chapters  
- `POST /v1/chapters/:id/qualify` - Qualify for rewards
- `GET /v1/chapters/:id/slots` - Get remaining slots
- `POST /v1/chapters/:id/claim` - Claim SOL reward

### Admin
- `POST /v1/admin/chapters/:id/end` - End chapter and create pack

## Environment Variables

See `.env.example` for complete list of required environment variables.

### Required Services
1. **Privy**: Authentication and wallet management
2. **Supabase**: Database, realtime, and storage
3. **Cloudflare Turnstile**: Bot protection
4. **Solana RPC**: Blockchain interactions

## Development Notes

### Database Schema
The database schema is defined in the PRD and includes:
- `users` - Privy user mapping
- `chapters` - Game chapters with prize pools
- `clues` - Individual clues with answer hashes
- `proofs` - User clue solutions
- `qualifications` - Chapter completions with ranks
- `winners` - Top 10 winners with claim status
- `throttles` - Cooldown management

### Solana Integration
- Vault keypair holds prize pool funds
- Server-side transfers to winner addresses
- Transaction signatures stored for transparency

### Error Handling
Standardized error responses with:
- `error`: Machine-readable error code
- `message`: User-friendly error message  
- `retry_after`: Cooldown time in seconds (when applicable)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

[Add your license here]
