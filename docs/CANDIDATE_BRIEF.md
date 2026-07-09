# Candidate Brief — Shopper Checkout Ticket

## Ticket requirements

### Story

As a shopper, I want to browse products, manage my basket, apply an eligible promotional offer, choose a delivery option, and complete payment, so that I can place an online order.

### Description

The shopper journey should support product discovery, basket management, checkout, payment, and order history.

## Acceptance criteria

- Shoppers can search and sort the product catalogue.
- Shoppers can add available products to the basket.
- Shoppers can update quantities or remove items from the basket.
- Shoppers can continue from basket to checkout.
- Checkout should show the products being purchased and the total payable.
- Shoppers can apply eligible promotional offers.
- Shoppers can choose a delivery option.
- Completed orders should appear in order history.
- Order information can be exported.

## Validation

- Basket quantities should respect product availability.
- Promotional offers cannot be combined with other offers or discounts.
- Required delivery and payment details must be provided before placing an order.

## Test data

Account credentials will be provided separately.

Promo codes:

| Code |
|---|
| `SAVE10` |
| `WELCOME5` |

Payment cards:

| Card type | Card number |
|---|---|
| Accepted test card | `4242424242424242` |
| Declined test card | `4000000000000002` |

## To test

Open the deployed staging URL and begin testing the shopper checkout ticket.

## Output

Once testing is complete, collate your feedback. During the interview, talk us through your findings, your test approach and the choices you made.

You may choose to submit your completed feedback using one of the following options:

1. Private GitHub repository
2. ZIP file
3. A combination of both, if preferred

P.S. .zip, word, Excel, PDF, and Markdown documents are acceptable.
