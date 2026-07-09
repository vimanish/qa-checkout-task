# Hiring Manager Guide — Keep Private

Do not share this file with candidates.

## Purpose

This app evaluates Senior QA Automation Engineers without requiring product knowledge transfer. The workflow is intentionally familiar: online shopping checkout, with payment separated from the shop/basket page.

The aim is to assess whether the candidate can:

- understand a ticket quickly;
- identify high-risk areas;
- design pragmatic manual and automated coverage;
- validate calculations, stock, payment and export data;
- communicate defects clearly;
- explain automation trade-offs in the panel interview.

## Recommended interview format

1. Send the candidate the deployed URL and the candidate brief.
2. Give them 3 to 5 hours.
3. Ask for a small repo or ZIP containing tests and notes.
4. In the technical panel, ask them to walk through:
   - their risk assessment;
   - their highest-value automated tests;
   - the defects they found;
   - what they intentionally skipped;
   - how they would improve the suite in CI.

## Known seeded defects

The app intentionally exposes mixed locator styles and an enterprise-style Orders grid. This is not a defect; it is there to evaluate locator strategy and how candidates automate complex tabular UI without relying on a single selector convention.

Reset data should preserve the active session. If it logs the user out, that is no longer intended.

These defects are intentionally present. Candidates do not need to find all of them. Strong senior candidates should find several high-risk issues and explain sensible trade-offs.

| # | Area | Requirement | Actual seeded defect | Suggested severity |
|---|---|---|---|---|
| 1 | Product search | Search should match name, SKU, brand or category | SKU is ignored by product search | Medium |
| 2 | Product sorting | Stock low-to-high should show sold-out/low-stock products first | Stock sort is reversed high-to-low | Low/Medium |
| 3 | Sold-out product | Sold-out products should not be addable | Sold-out product still shows enabled Add to basket button; API then errors | Medium |
| 4 | Quantity boundary | Cart quantity must be 1 to available stock, maximum 5 | Direct cart update API accepts quantity 0 and keeps a zero-quantity basket row | Medium/High for API coverage |
| 5 | Delivery fee | Express delivery is always £7.99 | Express becomes free when subtotal is £50+ | High |
| 6 | SAVE10 promo | SAVE10 is 10% off subtotal, capped at £20 | Cap is missing; high basket values get excessive discount | High |
| 7 | WELCOME5 boundary | WELCOME5 applies when subtotal is at least £30 | Exact £30 subtotal does not receive discount; only > £30 works | Medium |
| 8 | Payment decline | Declined card `4000000000000002` must block checkout | Declined card is accepted | Critical |
| 9 | Payment validation | Unrecognised card numbers should be rejected | Any non-empty card number is accepted | High |
| 10 | Address validation | Postcode should be a valid UK-looking postcode | Arbitrary postcode text is accepted | Medium |
| 11 | Order completion state | Successful order should clear basket and prevent duplicate ordering from the same basket | Basket remains populated after order confirmation, allowing repeat order attempts | High |
| 12 | CSV export typo | Export headers should use correct business terminology | CSV header says `Delivey Fee` instead of `Delivery Fee` | Low |
| 13 | CSV export values | Export totals should match the order history grid and confirmed order | CSV Total column exports subtotal instead of total | Medium/High |
| 14 | Promo stacking | Only one promo code should be active per order; applying a second promo should replace the first, and duplicate promo use should not increase the discount | Multiple promo codes can be stacked, and the same code can be applied repeatedly to increase the discount | High |

### Evidence ideas

1. Search `SKU-LAP-13-PRO`; expected NovaBook Pro 13, actual no matching product.
2. Sort by stock low-to-high; expected sold-out/low-stock items first, actual high-stock items appear first.
3. Locate the sold-out PortHub HDMI Travel Hub; Add to basket button is enabled and produces an error on click.
4. Use an API request or browser network replay to patch a basket item quantity to `0`; expected 400/remove, actual zero-quantity row can remain.
5. Add Auralite Pods (£179), select Express; expected £7.99 delivery, actual £0.00.
6. Add NovaBook Pro 13 (£1299), apply SAVE10; expected max discount £20, actual £129.90.
7. Add Lumina Desk Lamp (£30), apply WELCOME5; expected £5 discount, actual £0.
8. Use declined card `4000000000000002`; expected checkout blocked, actual order confirmed.
9. Use card `1234`; expected payment validation error, actual order confirmed.
10. Enter postcode `ABC`; expected validation error, actual order confirmed.
11. Place an order, then check checkout/shop basket; expected empty basket, actual items still present.
12. Export orders CSV; header contains typo `Delivey Fee`.
13. Export orders CSV after a discounted/delivery order; Total column does not match grid/order total.
14. Add RoomBeam Mini Speaker (£79), apply `WELCOME5`, then apply `SAVE10`; expected one active promo, actual both promos are shown and both discounts are included. Apply `SAVE10` twice to see duplicate discounting.

## Scoring rubric

### Manual QA thinking — 30%

- Understands the ticket quickly.
- Prioritises shop/basket, money, stock, checkout/payment and export data.
- Explains what is in and out of scope.
- Reports defects clearly with severity and evidence.

### Automation design — 35%

- Uses Playwright or Cypress idiomatically.
- Chooses a sensible locator strategy across mixed real-world selectors: roles/labels, scoped row locators, data attributes and grid cells.
- Has useful helper functions/fixtures.
- Makes meaningful assertions around totals, payment behaviour, stock behaviour and order/export data.
- Covers happy path plus negative paths.

### Defect quality — 20%

- Clear expected vs actual.
- Reproducible steps.
- Evidence such as screenshots, traces or console/browser output.
- Good severity judgement.

### Communication and seniority — 15%

- Concise, pragmatic and risk-led.
- Explains trade-offs.
- Can discuss CI, maintainability and future coverage.

## Red flags

- Only automates the happy path.
- Produces many weak visibility assertions.
- Does not test totals, delivery rules, stock/quantity or payment failure.
- Cannot explain why tests were chosen.
- Brittle selectors based only on styling, deep div chains or column indexes when safer row/role/data locators exist.
- No defect evidence.
- No clear timebox trade-offs.

## Suggested panel questions

1. Which scenario did you automate first and why?
2. Which defect has the highest business risk?
3. How would you avoid flaky tests in this app?
4. What would you add to CI?
5. What did you intentionally not automate within the timebox?

## task_16 note

The candidate-facing ticket has intentionally been made less prescriptive. It now describes normal shopper acceptance criteria and includes only essential test data. The exact delivery fees, promo eligibility details, postcode expectation, CSV consistency expectation and seeded-defect list remain private in this guide so candidates are not over-directed toward known defect areas.
