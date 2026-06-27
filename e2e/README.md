# e2e checks

Browser-driven smoke checks that exercise real user flows against a running
server. They use [`playwright-core`](https://playwright.dev/) with a
Chromium-based browser already installed on the machine (system Edge by
default — no large browser download).

## security-quote.mjs

Drives the Security Solutions quote wizard end-to-end and asserts the
database-backed behaviour:

- categories and product cards load from Postgres (`GET /api/products`)
- sale price renders (current price + struck-through original + "Sale" badge)
- quantity steppers update a live subtotal
- the summary computes item subtotal + installation fee + 10% GST
- an out-of-stock product is shown disabled and cannot be selected
- a product added via the dashboard API appears with no redeploy

It seeds a temporary product through `/api/dashboard/update` and deletes it
again at the end, so it leaves the catalogue exactly as it found it.

### Run

```bash
npm run dev          # terminal 1 — start the app
npm run e2e:quote    # terminal 2 — run the check
```

Exits non-zero if any assertion fails. Screenshots for each step are written
to `e2e/screenshots/` (gitignored).

### Env overrides

| Var             | Default                                   | Purpose                          |
| --------------- | ----------------------------------------- | -------------------------------- |
| `BASE_URL`      | `http://localhost:3000`                   | server under test                |
| `PW_EXECUTABLE` | system Edge path                          | any Chromium-based browser binary |
| `OUTDIR`        | `e2e/screenshots`                         | screenshot output directory      |

On non-Windows machines (or if Edge isn't installed) set `PW_EXECUTABLE` to a
Chrome/Chromium binary, e.g.
`PW_EXECUTABLE=/usr/bin/chromium npm run e2e:quote`.
