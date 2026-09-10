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

## Scope note

This experiment covers CRUD + the data layer only. Intentionally not
included yet (arriving in later experiments):
- Input validation library (Joi/Zod), rate limiting, CORS/Helmet hardening — **Experiment 5**
- Password hashing and JWT auth/role checks — **Experiment 6**
- A Postman collection exercising all of the above — **Experiment 7**
