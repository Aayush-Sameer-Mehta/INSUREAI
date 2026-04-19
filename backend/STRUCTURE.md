# Backend Structure

This backend now follows a domain-first layout.

## Top Level

```text
backend/
  server.js                    # Thin entry wrapper -> src/server.js
  package.json
  seed.js
  scripts/
  tests/
  storage/
    uploads/
    policy-documents/
  src/
    app.js
    server.js
    config/
      database.js
    domains/
      <domain>/
        routes/
        services/
        models/
    middleware/
    utils/
    validators/
```

## Domains Added

- `admin`
- `agents`
- `ai`
- `analytics`
- `auth`
- `claims`
- `documents`
- `notifications`
- `payments`
- `policies`
- `recommendations`
- `reports`
- `shared`
- `users`

## Notes

- `src/app.js` now imports routes from `src/domains/*/routes`.
- Legacy `src/routes`, `src/services`, `src/modules`, and `src/models` folders are removed.
- Add new code directly under `src/domains/<domain>/...`.
