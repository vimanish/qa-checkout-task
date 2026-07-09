# Checkout QA Assessment - task_20

A focused take-home assessment app using a sample online shopping journey.

The app deliberately uses a familiar online-shopping flow with a separate checkout/payment step so candidates can start testing immediately without a product knowledge-transfer session. task_20 keeps the focused shopper journey, updates the ticket output guidance for the engineering take-home guidelines, removes the old timebox label from the login page, and preserves the private seeded-defect guide for interview evaluation. The UI is intentionally limited to a ticket brief, a shop/basket page, a checkout/payment page and an orders/export page with an enterprise-style grid.

## Run locally

No runtime dependencies are required for the app itself.

```bash
node server.js
```

Open:

```text
http://localhost:4174
```

## Local account

For local review, use:

```text
shopper@test.local / Automation123!
```

The app no longer displays credentials in the UI. Share the account details with candidates separately.

## Test data shown in the app

| Data | Value |
|---|---|
| Accepted test card | `4242424242424242` |
| Declined test card | `4000000000000002` |
| Promo code | `SAVE10` |
| Promo code | `WELCOME5` |

## Deployment

### Node

```bash
PORT=4174 node server.js
```

### Docker

```bash
docker build -t checkout-sr-qa-assessment .
docker run -p 4174:4174 checkout-sr-qa-assessment
```

## Candidate task shape

Ask the candidate to treat this as a checkout release going to staging. The app gives them a ticket-style brief and one familiar shopper journey split across Shop & basket, Checkout / payment and Orders / export.

A candidate should not be expected to test every product or automate every scenario. Strong candidates will explain trade-offs.

## Files

```text
server.js                    Node HTTP server for the assessment app
public/index.html            SPA entry point
public/app.js                SPA behaviour
public/styles.css            App styling
docs/CANDIDATE_BRIEF.md      Candidate-facing ticket summary
docs/HIRING_MANAGER_GUIDE.md Keep private
tests/example.spec.js        Starter Playwright examples
```

## Reset test data

Use the **Reset data** button in the app header before each new candidate run. Reset now preserves the active signed-in session while clearing products, basket, orders and audit state.

## Automation surfaces

The app deliberately uses mixed, realistic locator options instead of giving every element the same test id. Candidates can choose from accessible labels, roles, scoped row attributes, product SKUs, action attributes and the Orders grid cell metadata.
