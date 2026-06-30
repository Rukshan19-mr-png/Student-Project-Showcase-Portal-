# Security Summary

## Protected Mutating Routes

All application mutating routes require authentication before changing data:

- `POST /projects` requires an authenticated `STUDENT`.
- `PUT /projects/:id` requires the authenticated owner of the project.
- `DELETE /projects/:id` requires the authenticated owner or an `ADMIN`.
- `POST /projects/:id/like` and `DELETE /projects/:id/like` require authentication and only affect the current user's like record.
- `POST /users/:id/follow` and `DELETE /users/:id/follow` require authentication and only affect the current user's follow record.
- `PATCH /notifications/:id/read` requires authentication and ownership of the notification.
- `PATCH /notifications/read-all` only updates notifications belonging to the authenticated user.
- `POST /auth/logout` requires authentication before clearing the session cookie.

`POST /auth/mock-login` is a development-only auth helper. It is rate-limited, validates input, and is disabled when `NODE_ENV=production`.

## Input Validation

Server-side validation is enforced with Zod for request bodies, route IDs, and pagination/query parameters. Project text fields are trimmed and bounded, repository URLs must be valid HTTP(S) URLs, UUID route parameters are checked before database access, and pagination limits are capped.

## Rate Limiting

Auth endpoints are rate-limited by client IP. Like/unlike endpoints are rate-limited by authenticated user when available, with IP fallback.

## Sessions and Cookies

Google OAuth sessions use JWT cookies with `httpOnly`, `sameSite`, `secure` in production, path `/`, and a 7-day expiry. Bearer tokens used by the development mock-login flow expire after 24 hours. JWT secrets must be configured in production.

## Upload Safety

Uploaded thumbnails are restricted to JPEG, PNG, GIF, and WebP files with a 5MB size limit. Filenames are generated server-side with random UUIDs, uploads are stored inside the configured uploads directory, and file deletion resolves paths safely to avoid arbitrary path overwrite or deletion.

## Notes

Google OAuth now fails closed with `503` if OAuth credentials are not configured, instead of crashing the API. `npm audit` currently reports moderate Prisma development dependency advisories; the suggested automatic fix is a breaking downgrade, so review before applying.
