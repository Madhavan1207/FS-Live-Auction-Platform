# Live Auction Platform — Backend (Experiment 4)

Express + MongoDB/Mongoose REST API for the Live Auction Platform. This is a
separate Node service from the React frontend built in Experiments 1–3.

## Setup

```bash
cd live-auction-backend
npm install
cp .env.example .env
```

Edit `.env` and set `MONGODB_URI` to either:
- A local MongoDB (`mongodb://127.0.0.1:27017/live-auction`) if you have
  MongoDB installed, or
- A free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
  cluster connection string (recommended if you don't want to install
  MongoDB locally — you'll want an Atlas cluster for Experiment 7's
  Postman testing anyway).

Then run:

```bash
npm run dev
```

The API starts on `http://localhost:5000` (or whatever `PORT` you set).

## Endpoints

**Items**
| Method | Route | Description |
|---|---|---|
| GET | `/api/items` | List all items |
| GET | `/api/items/:id` | Get one item |
| POST | `/api/items` | Create an item |
| PUT | `/api/items/:id` | Update an item |
| DELETE | `/api/items/:id` | Delete an item |

**Bids** (nested under an item)
| Method | Route | Description |
|---|---|---|
| GET | `/api/items/:itemId/bids` | List bids for an item |
| POST | `/api/items/:itemId/bids` | Place a bid (rejects if not higher than current bid) |
| DELETE | `/api/bids/:id` | Delete a bid by its own id |

**Users**
| Method | Route | Description |
|---|---|---|
| GET | `/api/users` | List users (passwords excluded) |
| GET | `/api/users/:id` | Get one user |
| POST | `/api/users` | Create a user |
| PUT | `/api/users/:id` | Update a user |
| DELETE | `/api/users/:id` | Delete a user |

**Health check**: `GET /api/health` → `{ status: "ok" }`

## Security (Experiment 5)

- **Joi validation** on every POST/PUT request body (`src/validation/`), enforced via a `validate()` middleware before the request reaches a controller.
- **Rate limiting** (`express-rate-limit`): a general 300 requests/15 min limit across the whole API, plus a stricter 10 bids/minute limit specifically on `POST /api/items/:itemId/bids` to prevent bid spamming.
- **Helmet** sets standard protective HTTP headers.
- **CORS** is restricted to the frontend's origin only (`FRONTEND_ORIGIN` in `.env`), instead of allowing any site to call the API.
- **express-mongo-sanitize** strips any request keys shaped like a MongoDB operator (e.g. `$gt`), preventing basic NoSQL injection.
- **Centralized error handler** now returns the correct status code for common failure types: `400` for an invalid ObjectId or failed Mongoose validation, `409` for a duplicate key (e.g. email already registered), `500` as the final fallback.

## Auth (Experiment 6)

- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me` (protected).
- Passwords are hashed with bcrypt via a Mongoose pre-save hook — never stored in plain text.
- JWT issued on register/login, verified on every protected route via the `protect` middleware.
- Role enforcement via `authorize(...roles)`: only `seller`/`admin` can create/edit/delete items; only `buyer` can place bids; `/api/users` is `admin`-only.
- `seller`/`bidder` identity is always taken from the verified token (`req.user`), never trusted from the request body.
- Item update/delete additionally checks ownership: only that item's own seller (or an admin) can modify it.

## Real-time (Experiment 8)

Socket.io runs on the same port as the REST API (`src/socket.js`, attached in `server.js`).

| Event | Direction | Sent to | Payload |
|---|---|---|---|
| `joinItem` / `leaveItem` | client -> server | - | item id (validated as an ObjectId) |
| `viewerCount` | server -> client | everyone in that item's room | `{ itemId, count }` |
| `bidPlaced` | server -> client | room `item:<id>` only | `{ bid, item, extended }` |
| `itemUpdated` | server -> client | everyone connected | updated item (Browse cards) |
| `itemCreated` | server -> client | everyone connected | the new item |

Anti-sniping: a bid placed in the last 30 seconds extends the auction by 30 seconds.

## Scope note

CI/CD (Experiment 9) and Docker (Experiment 10) are still to come.
