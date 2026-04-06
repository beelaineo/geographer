# Sanity → Next.js on-demand revalidation

The web app exposes **`POST /api/revalidate`**, which Sanity should call when content changes so cached GROQ results are dropped and pages rebuild on the next request.

## Environment variables

| Variable | Where | Purpose |
|----------|--------|---------|
| `SANITY_REVALIDATE_SECRET` | **Next.js** (Vercel, Netlify, `.env.local`, etc.) | Shared secret; must match what you send from Sanity. |
| Same value | Sanity webhook (as Bearer token or query param) | Authenticates the webhook. |

Generate a long random string (for example `openssl rand -hex 32`). **Do not commit it** to the repo.

## Sanity webhook configuration

1. Open **[sanity.io/manage](https://www.sanity.io/manage)** → your project → **API** → **Webhooks** → **Create webhook**.
2. **Name:** e.g. `Next.js revalidate (production)`.
3. **URL:**  
   `https://<your-production-domain>/api/revalidate`  
   Use your real deploy URL (no trailing slash). For local testing you can use a tunnel (ngrok, etc.) pointing at `http://localhost:3000/api/revalidate`.
4. **Dataset:** choose the dataset the site reads (e.g. `redesign` or `production`), matching `NEXT_PUBLIC_SANITY_DATASET` / your deployed env.
5. **Trigger on:** Create, Update, Delete (or at least **Update** and **Create**).
6. **Filter** (optional but recommended): leave empty to send all document types, or restrict to types you edit in Studio (see table below). The handler ignores unknown `_type` values and returns `202` without revalidating.
7. **HTTP method:** `POST`.
8. **HTTP Headers:** add  
   `Authorization: Bearer <SANITY_REVALIDATE_SECRET>`  
   (use the same secret as in Next.js).  
   **Alternatively**, you can omit the header and call  
   `https://<domain>/api/revalidate?secret=<SANITY_REVALIDATE_SECRET>`  
   (less ideal if the URL is logged anywhere).
9. **Payload:** Default JSON payload is fine. The route reads `_type`, `slug`, and `documentId` from the body (including nested `document` when present).

After saving, use **Deliver webhook** / **Test** in Sanity and confirm your Next.js logs show a successful revalidation (or check the JSON response for `"revalidated": true`).

## Tag mapping (document `_type` → cache tags)

These tags match `lib/sanityCacheTags.ts` and `fetchSanityQuery` usage across routes.

| Sanity `_type` | Tags revalidated |
|----------------|------------------|
| `homepage` | `sanity:homepage` |
| `about` | `sanity:about` |
| `siteSettings` | `sanity:siteSettings` |
| `clubEden` | `sanity:clubEden` |
| `reclus` | `sanity:reclus` |
| `collection` | `sanity:collection:list`, `sanity:collection:<slug>` |
| `project` | `sanity:project:list`, `sanity:project:<slug>` |
| `release` | `sanity:release:list`, `sanity:release:<slug>`, `sanity:homepage`, plus any `sanity:collection:*` / `sanity:project:*` that reference this release |
| `interview` | `sanity:interview:list`, `sanity:interview:<slug>`, `sanity:homepage` |
| `contributor` | `sanity:interview:list` (author names on interview listings) |

### Routes and tags (cached fetches)

| Area | Tags used |
|------|-----------|
| Home (`/`) | `sanity:homepage`, `sanity:release:list`, `sanity:interview:list` |
| About | `sanity:about` |
| Site settings (layout, metadata helpers) | `sanity:siteSettings` |
| Club Eden index | `sanity:clubEden`, `sanity:release:list`, `sanity:collection:list` |
| Club Eden collection | `sanity:collection:<slug>`, `sanity:collection:list` |
| Releases `[slug]` | `sanity:release:<slug>`, `sanity:release:list` |
| Interviews `[slug]` | `sanity:interview:<slug>`, `sanity:interview:list` |
| Reclus singleton | `sanity:reclus` |
| Reclus gallery / index | `sanity:interview:list` |
| Collections `[slug]` | `sanity:collection:<slug>`, `sanity:collection:list` |
| Projects `[slug]` | `sanity:project:<slug>`, `sanity:project:list` |

**Draft / preview mode** uses `cache: "no-store"` for fetches, so tags mainly affect **published** traffic with `force-cache`.

## Troubleshooting

- **401:** Secret mismatch between webhook and `SANITY_REVALIDATE_SECRET` on the server.
- **500 missing secret:** `SANITY_REVALIDATE_SECRET` not set in the deployment environment.
- **202 with message about unhandled type:** Add a `case` in `app/api/revalidate/route.ts` or restrict the webhook filter so those documents are not sent (if intentional).
- **Slug missing on webhook:** Some transitions only send `_id`; the handler still revalidates list tags. Per-slug tags need `slug.current` in the payload when available.
