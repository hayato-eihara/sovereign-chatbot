# Sovereign Chatbot — AI Sales Assistant Widget

## What This Is
An open-source, embeddable AI chatbot widget that turns any website into an intelligent sales assistant. First deployment target: japanclassic.shop (Japanese handmade ceramics e-commerce). This will become an OSS project on GitHub and simultaneously serve as a real-world case study with measurable data.

## Architecture
- Widget: TypeScript + React, embedded via single script tag, rendered in Shadow DOM for style isolation
- Backend: Supabase (PostgreSQL for conversation logs, Edge Functions for API routing, pgvector for RAG)
- AI: OpenAI API (GPT-4o) with RAG pipeline - retrieves relevant product/policy data before generating responses
- Deployment: Vercel

## Key Design Principles
1. One-line embed - a single script tag and it works
2. RAG-powered - knows the store's products, prices, policies, shipping details
3. Sales-oriented - detects purchase intent and recommends specific products
4. Beautiful by default - premium look and feel, no cheap widget aesthetic
5. Modular for OSS - any developer can fork, configure, and deploy

## Tech Stack
- TypeScript strict mode
- React 18 (widget only)
- Tailwind CSS (within Shadow DOM)
- Supabase (PostgreSQL + pgvector + Edge Functions + Auth)
- OpenAI API (text-embedding-3-small for vectors, GPT-4o for generation)
- Vercel (hosting)

## Code Standards
- No prototypes. Everything is production quality.
- No unnecessary dependencies. Every package justified in DECISIONS.md.
- English for all code, comments, docs, README.
- Japanese only in knowledge base content when configured.
- Every major technical decision documented in DECISIONS.md.

## Credit Conservation Rules
- No trial-and-error loops. Design first, implement once.
- No unnecessary file reads.
- No cosmetic-only changes unless explicitly requested.
- Batch related changes into single operations.

## RAG Strategy
- Static knowledge base only. All files in /knowledge are vectorized with text-embedding-3-small and stored in Supabase pgvector
- Product catalog is 990+ handmade ceramic items. The chatbot does NOT need individual product data
- When users ask about specific products, the chatbot directs them to browse the store (japanclassic.shop/collections/all) or use the store's search
- The chatbot's primary value is answering shipping, returns, product care, and brand questions instantly — not replacing product browsing
