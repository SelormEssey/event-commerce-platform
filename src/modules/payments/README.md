# Future payments module

Sprint 0 contains status vocabulary only. There is no payment processing, provider SDK, endpoint, webhook, credential, or operational adapter.

Future flow: unified checkout → payment router → provider adapter → external provider → authenticated webhook/server verification → internal payment record → ticket issuance.

Keep the router and provider adapters here. The proposed operations are `initializePayment`, `verifyPayment`, `getPaymentStatus`, and `refundPayment`. Define concrete request/result contracts when the first real integration is specified; do not introduce placeholder methods returning fake success now.

Monime (Sierra Leone), Paystack (Ghana and Côte d’Ivoire), and Flutterwave (alternative) are candidates under evaluation, not enabled capabilities or promises of coverage. Enabled methods will be selected through the typed country registry.

Future work must verify provider signatures and payments on the server, handle duplicate notifications idempotently, check currency/amount/order identity, and prevent repeated ticket issuance. A browser redirect is never proof of payment. Never store raw card data. Use centralized, approved financial policy and currency-aware minor units; display formatting does not perform financial calculations.

Ticket status vocabulary currently lives in `src/domain/ticket-status.ts`. A ticketing module should be added when ticket issuance is implemented, not populated with fake behavior during Sprint 0.
