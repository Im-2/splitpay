# SplitPay

A group expense-splitting Mini App for **Nimiq Pay**. One person (the organizer) creates a split — a
total amount, a description, and a list of people who owe them — and shares one link. Each participant
opens that link, sees their share, and pays it directly to the organizer's Nimiq wallet with a real
on-chain NIM transaction. The organizer watches payments come in live.

Built for the Nimiq Mini Apps Competition, Cycle II.

## How it uses Nimiq Pay

Nimiq wallet interaction is not decorative — it is the entire mechanism the app is built around:

- **`nimiq.listAccounts()`** — captures the organizer's real address when they create a split, and
  (separately, with the participant's own consent) the viewer's address when they open one, both used
  to identify who's who and to read a wallet balance.
- **`nimiq.sendBasicTransactionWithData()`** — the actual payment. Tapping "Pay now" signs and
  broadcasts a real NIM transaction through Nimiq Pay's own confirmation dialog. Nothing about the
  payment is mocked or simulated.
- **Memo-based reconciliation** — every payment carries a plain-text memo,
  `splitpay:<splitId>:<participantId>`, in the transaction's data field. The organizer's status view
  reads the organizer's incoming transactions straight from the chain (via a public Nimiq RPC server)
  and matches memo + amount to figure out who has paid — no backend bookkeeping, no trusting the
  client to self-report.
- **Balance check** — the Pay screen reads the participant's on-chain balance (via
  `getAccountByAddress` over the same public RPC) and warns them upfront if it won't cover their share,
  without ever blocking the actual payment attempt if that read fails or is slow.

## Why no backend

A split's entire definition (description, total, organizer address, participant list) is encoded as
JSON, base64url-packed straight into the shareable link's `?s=` query parameter. Opening the link
decodes it client-side — there is nothing to look up, so there is no database for split *definitions*.

"Who has paid" is not something the client is trusted to report either: it's reconciled live by reading
the organizer's real transaction history from a public Nimiq RPC endpoint
([nimiq.dev/rpc/open-servers](https://nimiq.dev/rpc/open-servers)) and matching the
`splitpay:<splitId>:<participantId>` memo + exact share amount on each incoming transaction. The chain
itself is the database. This keeps the whole app static — it can be hosted as plain files with no
server, no secrets, and nothing to break.

The tradeoff: a split's fields are visible to anyone with the link (already true of a normal shared
bill), and links get long. Both are acceptable for a same-group expense-splitting tool built in three
days.

## Stack

- Vite + React + TypeScript
- [`@nimiq/mini-app-sdk`](https://www.npmjs.com/package/@nimiq/mini-app-sdk) for all wallet interaction
- No backend, no database, no analytics or tracking of any kind

## Project structure

```
src/
  lib/
    nimiqProvider.ts   # SDK init, RPC URL config, wallet error → user-facing message
    split.ts            # Split type, share math, link encode/decode
    reconcile.ts         # reads organizer's tx history, matches memos → paid/unpaid
    balance.ts            # reads a participant's on-chain balance
    format.ts              # NIM/Luna conversions & display
    participantStore.ts     # remembers "which participant am I" per split, per device
  components/
    CreateSplit.tsx     # organizer: build a split, get the share link
    SplitView.tsx        # routes a `?s=` link to the organizer or participant view
    ParticipantPicker.tsx # "which one are you?" (first visit to a link)
    PayShare.tsx           # participant: see share + balance, pay, see result
    OrganizerStatus.tsx     # organizer: live paid/unpaid list, polls + manual refresh
```

## Setup

```bash
npm install
npm run dev
```

Set the network in `.env` (defaults to testnet):

```
VITE_NIMIQ_NETWORK=test   # or 'main' once the flow is verified end-to-end
```

## Testing inside Nimiq Pay

This app only works inside Nimiq Pay — outside it, `window.nimiq` is never injected and wallet calls
have nothing to talk to. During development:

1. Run `npm run dev` and expose it (e.g. with a tunnel) so Nimiq Pay's mobile client can reach it.
2. In Nimiq Pay, use **Load a Local Mini App** with that URL.
3. Fund a test wallet from the [Nimiq testnet faucet](https://getsome.nimiq-testnet.com/) — do not use
   real mainnet NIM until the flow is confirmed working.
4. Create a split as the organizer, open the link as a participant on another device/account, pay, and
   confirm the organizer's status view picks it up.

Switch `VITE_NIMIQ_NETWORK=main` only after that full loop has been verified on testnet.

## Scope

Deliberately v1: even splits only (no weighted/partial shares), NIM only (no USDT/EVM path), no
accounts, no history beyond the current split. See the competition brief for the full reasoning — the
short version is that a three-day build should do one thing completely rather than five things
partially.
