# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development (required NODE_OPTIONS for node-compat shim)
npm run dev          # Start dev server with Turbopack
npm run dev:daemon   # Start in background, logs to logs.txt

# Build & Production
npm run build
npm run start

# Database
npm run setup        # First-time: install deps + prisma generate + migrate
npm run db:reset     # Reset DB (destructive)

# Testing & Linting
npm run test         # Run Vitest tests
npm run lint         # ESLint via next lint
```

Path alias: `@/*` → `src/*`

## Architecture

UIGen is an AI-powered React component generator. Users describe UI and Claude generates live-previewed React components using a virtual file system.

### Core Flow

1. User sends chat → `ChatInterface` → POST `/api/chat`
2. API streams Claude's response using Vercel AI SDK (`streamText`)
3. Claude uses two tools to write code:
   - `str_replace_editor` — create/view/modify files in VirtualFileSystem
   - `file_manager` — rename/delete files
4. `PreviewFrame` transpiles JSX via Babel Standalone and renders it live
5. On completion, project state (messages + VFS) is saved to SQLite via Prisma

### Virtual File System

`src/lib/file-system.ts` — in-memory only, no disk writes. Serializes to JSON for persistence in `Project.data` (Prisma). Reconstructed from DB on each API call.

### State Management

- `FileSystemContext` (`src/lib/contexts/`) — manages VFS state across the app
- `ChatContext` — manages messages and streaming status, wraps Vercel AI SDK's `useChat`
- No global state library; React contexts only

### Layout

3-panel layout in `src/app/main-content.tsx`:
- **Left (35%)**: `ChatInterface` (messages + input)
- **Right (65%)**: toggleable between `PreviewFrame` (live preview) and split `FileTree` / `CodeEditor` (Monaco)

### Authentication

- JWT stored in httpOnly cookies, validated in `src/middleware.ts`
- Server actions in `src/actions/` handle signUp/signIn/signOut/getUser
- Passwords hashed with bcrypt
- Anonymous users get ephemeral sessions (no persistence)

### Database

SQLite via Prisma. Two models:
- `User`: id, email, password
- `Project`: id, name, userId, messages (JSON), data (JSON VFS state)

### AI Model

Uses `claude-haiku-4-5-20251001` via `@ai-sdk/anthropic`. Falls back to a mock static provider if `ANTHROPIC_API_KEY` is missing (see `src/lib/provider.ts`).

### Key Files

| File | Purpose |
|------|---------|
| `src/app/api/chat/route.ts` | Main AI endpoint, tool orchestration |
| `src/lib/file-system.ts` | VirtualFileSystem class |
| `src/lib/provider.ts` | LLM provider config + mock fallback |
| `src/lib/tools/` | Tool definitions for Claude |
| `src/lib/prompts/` | System prompts for generation |
| `src/components/preview/` | Babel transpilation + live render |
| `src/actions/index.ts` | Auth server actions |
| `prisma/schema.prisma` | DB schema |
