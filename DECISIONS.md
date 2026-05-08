# Technical Decisions

This file records major architectural and technology choices made during the development of Sovereign Chatbot. Each entry explains what was decided, why, and what trade-offs were accepted.

---

## 1. Shadow DOM for widget isolation

**Context:** The widget is injected into third-party websites over which we have no control. Host sites use arbitrary CSS frameworks (Bootstrap, Tailwind, custom styles) that can bleed into injected DOM.

**Decision:** Render the entire widget inside a Shadow DOM root attached to a single host element.

**Reasoning:** Shadow DOM provides a hard boundary — host CSS cannot penetrate it and widget styles cannot leak out. This is the only reliable way to guarantee visual consistency across every host site without asking the site owner to change anything.

**Trade-offs:**
- Fonts and CSS custom properties from the host page are not inherited; they must be explicitly defined inside the shadow root.
- Some third-party libraries assume `document` as their root and break when used inside Shadow DOM — library selection must account for this.
- Slightly more complex mount logic compared to a plain `div`.

---

## 2. Supabase as the unified backend platform

**Context:** The project needs a relational database, a vector store, an auth layer, and serverless API functions. Using separate services for each would multiply operational complexity.

**Decision:** Use Supabase for everything: PostgreSQL (data), pgvector (embeddings), Auth (dashboard access), and Edge Functions (API layer).

**Reasoning:** Supabase provides all four capabilities on a single platform with a unified SDK. This eliminates cross-service auth, network overhead between services, and separate billing/monitoring surfaces. The free tier covers the expected load for the initial deployment.

**Trade-offs:**
- Vendor lock-in to Supabase's platform and pricing model.
- Edge Functions run on Deno, not Node.js — some npm packages are not available.
- Supabase's managed PostgreSQL has less tuning flexibility than self-hosted Postgres.

---

## 3. pgvector with HNSW index (not IVFFlat)

**Context:** pgvector supports two approximate nearest-neighbor index types: IVFFlat and HNSW.

**Decision:** Use HNSW.

**Reasoning:** IVFFlat requires training on a representative dataset — it divides vectors into lists (clusters) at index-build time. With fewer than a few thousand vectors, the cluster boundaries are poorly defined and search recall degrades significantly. HNSW builds a hierarchical graph structure that delivers stable recall regardless of dataset size. For a knowledge base that starts small and grows incrementally, HNSW is the correct default.

**Trade-offs:**
- HNSW indexes consume more memory than IVFFlat (roughly 8 bytes × dimensions × M neighbors per vector, where M defaults to 16).
- HNSW build time is slower than IVFFlat, but this is irrelevant since the knowledge base is indexed offline, not in real time.

---

## 4. GPT-4o-mini instead of GPT-4o for chat responses

**Context:** The chatbot answers questions about a store's products, policies, and shipping. Responses are short (2–5 sentences) and factual, grounded by retrieved context.

**Decision:** Use `gpt-4o-mini` as the generation model.

**Reasoning:** The task is retrieval-augmented generation with a narrow domain. The hard part is retrieval quality, not reasoning depth. GPT-4o-mini produces indistinguishable output quality for this use case at roughly 1/10th the cost and with lower latency. GPT-4o is the right choice when multi-step reasoning, long-context comprehension, or complex instruction-following is required — none of which apply here.

**Trade-offs:**
- GPT-4o-mini may handle genuinely ambiguous or complex user questions less gracefully.
- If the use case evolves toward complex multi-turn sales qualification, the model may need to be upgraded.

---

## 5. text-embedding-3-small instead of text-embedding-3-large

**Context:** All knowledge base content is vectorized with an OpenAI embedding model. The choice of model affects retrieval quality, cost, and throughput.

**Decision:** Use `text-embedding-3-small` (1536 dimensions).

**Reasoning:** OpenAI's own benchmarks show that `text-embedding-3-small` achieves ~87% of `text-embedding-3-large`'s retrieval performance on MTEB at roughly 1/5th the cost. For a knowledge base of product descriptions, shipping policies, and FAQs — mostly short, factual text — the quality gap is negligible in practice. The cost and latency savings compound at scale (990+ product catalog, re-indexing on updates).

**Trade-offs:**
- On highly nuanced or technical text where semantic precision matters, `3-large` may produce meaningfully better retrieval.
- If re-indexing is needed after a model change, all existing embeddings must be recomputed.

---

## 6. Cosine similarity computed client-side (widget), not via Supabase RPC

**Context:** The RAG pipeline needs to find the top-k knowledge chunks closest to the user's query embedding. The natural approach is a Supabase RPC call (`match_knowledge`) using pgvector's `<=>` operator inside a stored function.

**Decision:** Fetch all embeddings from Supabase and compute cosine similarity in the widget (browser-side JavaScript).

**Reasoning:** The `match_knowledge` RPC function was producing inconsistent results — likely due to Supabase's connection pooling behavior with pgvector functions in early project stages. Since the knowledge base has fewer than 100 chunks, fetching all embeddings and sorting them in memory is negligible in terms of payload size (<200KB) and computation time (<5ms). This approach is simpler, fully deterministic, and removes a Supabase-side failure surface.

**Trade-offs:**
- Does not scale beyond ~500–1000 chunks before fetch payload and sort time become noticeable.
- Embeddings are sent to the browser, which is fine for non-sensitive knowledge base content but would be inappropriate for confidential data.
- When the knowledge base grows, this must be replaced with server-side vector search.

---

## 7. localStorage for session management

**Context:** The widget needs to maintain a session ID across page reloads so that conversation history can be retrieved and continued.

**Decision:** Store the session ID in `localStorage` under a namespaced key.

**Reasoning:** `localStorage` is simpler to implement than cookies in a Shadow DOM context — no need to handle `SameSite`, `HttpOnly`, or cross-origin cookie restrictions. The session ID is not a security credential; it is a random UUID used only to group conversation rows. `localStorage` is appropriate for this level of sensitivity. Cookie complexity is not justified.

**Trade-offs:**
- `localStorage` is not shared across subdomains (e.g., `shop.example.com` and `example.com` have separate storage).
- Users who clear browser storage lose their conversation history — acceptable for a sales chatbot where continuity is a convenience, not a requirement.
- Not available in certain privacy-hardened browser configurations or private browsing modes; the widget falls back gracefully to a new session on each load.
