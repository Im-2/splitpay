# SplitPay — submission description

SplitPay is a group expense-splitting Mini App for Nimiq Pay. One person creates a "split" — a total
amount, a description, and the people who owe them — and gets a single shareable link. Everyone else
opens that link inside Nimiq Pay, sees their even share, and pays it with one tap as a real on-chain NIM
transaction. The organizer watches who's paid and who hasn't, live.

It's for any group that fronts a shared cost and needs the rest back: roommates splitting rent, friends
splitting a trip, a team splitting a gift or project expense. Not restaurant-specific — any even split
of a known total.

Nimiq wallet integration is the core mechanism, not a badge on top. The organizer's address comes from
`nimiq.listAccounts()`. Every payment is a real `sendBasicTransactionWithData()` call, signed and
broadcast through Nimiq Pay's own confirmation dialog — nothing is mocked. Each payment carries a plain
memo (`splitpay:<splitId>:<participantId>`), letting the organizer's status view reconcile who's paid by
reading their actual incoming transactions from the chain and matching memo plus amount — no backend, no
self-reported "I paid" button to fake. The Pay screen also reads the participant's live on-chain balance
and warns upfront if it won't cover their share, without blocking payment if that check fails.

There's no login system and no database: a split's definition lives entirely in its link, and "who's
paid" lives entirely on-chain. That keeps the app a static, secret-free client that only talks to Nimiq
Pay and a public Nimiq RPC endpoint.
