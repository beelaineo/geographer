# geographer

## Sanity → Next.js Revalidation

- Ensure `SANITY_REVALIDATE_SECRET` is set in the environment for the Next.js app and matches the value used in Sanity webhooks.
- Create a webhook in Sanity Studio (`Project settings → API → Webhooks`) pointing to `https://<your-site>/api/revalidate`. Attach an `Authorization: Bearer <secret>` header and limit the triggered document types to: `homepage`, `about`, `collection`, `project`, `release`, and `siteSettings`.
- Enable the webhook payload to include the published document and (optionally) the previous revision so slug information is available for deletes.
- For local testing run `pnpm dev` in `apps/web`, then post a payload: `curl -X POST http://localhost:3000/api/revalidate -H "Authorization: Bearer <secret>" -H "Content-Type: application/json" -d '{"_type":"homepage"}'`.
- Pages and metadata now fetch Sanity data through tagged helpers, so `revalidateTag` calls from the webhook will refresh affected routes immediately without waiting for ISR intervals.

## Redesign dataset workflow (no production data mutation)

- Use a dedicated dataset (for example `redesign` or `staging`) for schema transitions and content migration dry-runs.
- Point Studio to the redesign dataset with `SANITY_STUDIO_DATASET=redesign`.
- Point the staging web deployment to the same dataset with `NEXT_PUBLIC_SANITY_DATASET=redesign`.
- Keep production deployments pinned to `production` until redesign schemas/content are validated and ready to cut over.
- `apps/studio` now requires `SANITY_STUDIO_DATASET` to be set explicitly (no implicit fallback), reducing accidental writes to production during local development.
