# SFA Tests

End-to-end test suite for the [Science for Africa (SFA)](https://science-of-africa.akvotest.org) platform, built with [Playwright](https://playwright.dev/).

## Test Coverage

| Suite | File | What it tests |
|---|---|---|
| Login | `tests/login.spec.ts` | Email/password login flow |
| Community | `tests/community.spec.ts` | Join a community, verify subscriber count increments |
| Collaboration | `tests/collaboration.spec.ts` | Create a collaboration call through the full multi-step wizard |
| Sign-up | `tests/signup.spec.ts` | _(in progress)_ |
| Google Auth | `tests/googleauth.spec.ts` | _(in progress)_ |

Tests run against **Chromium**, **Firefox**, and **WebKit** by default.

## Prerequisites

- Node.js (LTS)
- npm

## Setup

```bash
npm install
npx playwright install --with-deps
```

Copy the environment template and fill in your credentials:

```bash
cp env.example .env
```

`.env` variables:

| Variable | Description |
|---|---|
| `BASE_URL` | Frontend URL (e.g. `https://science-of-africa.akvotest.org`) |
| `USERNAME` | Login email |
| `PASSWORD` | Login password |
| `STRAPI_URL` | Strapi CMS URL |
| `STRAPI_EMAIL` | Strapi admin email |
| `STRAPI_PASSWORD` | Strapi admin password |
| `RUN_STRAPI_TESTS` | Set to `true` to enable Strapi-specific tests |

## Running Tests

```bash
# Run all tests (headless)
npx playwright test

# Run with browser visible
npx playwright test --ui

# Run with browser visible
npx playwright test --headed



# Open the HTML report from the last run
npx playwright show-report

```

## CI

Tests run automatically on every push and pull request to `main`/`master` via GitHub Actions ([`.github/workflows/playwright.yml`](.github/workflows/playwright.yml)).

Credentials are stored as GitHub repository secrets:

- `BASE_URL`
- `PLAYWRIGHT_USERNAME`
- `PLAYWRIGHT_PASSWORD`

The HTML report is uploaded as a build artifact and retained for 30 days.

## Project Structure

```
.
├── tests/               # Main Playwright test suites
├── e2e/                 # Scaffold/example specs
├── playwright.config.ts # Playwright configuration
├── env.example          # Environment variable template
└── .github/workflows/   # CI pipeline
```
