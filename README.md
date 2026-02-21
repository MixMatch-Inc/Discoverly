# Discoverly 🍽✨

**Swipe. Match. Order. Pay with Stellar.**

Discoverly is a Tinder-style food ordering app where users swipe through food items, match with their cravings, and pay seamlessly using the Stellar blockchain.

Built with:

* ⚛️ **Expo (React Native)** – Mobile app
* 🟢 **Express.js** – Backend API
* ⭐ **Stellar** – On-chain payment processing
* 🍃 **MongoDB** – Data persistence

---

## 🚀 Overview

Discoverly reimagines food ordering with a swipe-based discovery experience.

Instead of scrolling through long menus:

* Users **swipe right** to like a dish
* Swipe left to skip
* Matched dishes go into their cart
* Payments are processed via **Stellar blockchain**

This allows:

* Fast crypto-native checkout
* Low transaction fees
* Borderless payments
* Transparent transaction tracking

---

## 🏗 Architecture

```
discoverly/
│
├── mobile/          → Expo (React Native) app
├── backend/         → Express.js API
├── stellar/         → Stellar payment utilities & services
└── README.md
```

### Mobile (Expo)

* Swipe UI (card stack)
* User authentication
* Wallet connection
* Order flow
* Payment confirmation

### Backend (Express)

* Auth & session management
* Restaurant & food listing APIs
* Match & cart management
* Order creation
* Stellar payment verification
* Webhook/event listeners

### Stellar Layer

* Wallet creation (optional custodial)
* Payment intent generation
* Transaction submission
* Transaction verification
* Payment status tracking

---

## ⚙️ Tech Stack

### Mobile

* Expo
* React Native
* React Navigation
* Axios
* Zustand (or preferred state manager)

### Backend

* Node.js
* Express.js
* MongoDB + Mongoose
* Stellar SDK
* JWT Authentication

### Blockchain

* Stellar Network
* Stellar SDK (JavaScript)
* Horizon API

---

## 🔑 Key Features

### 👤 User

* Register / Login
* Swipe-based food discovery
* Add to cart via match
* Checkout with Stellar
* View order history
* Track payment status

### 🍔 Restaurant

* Create food listings
* Manage availability
* Receive on-chain payments

### 💳 Payments (Stellar)

* Create payment request
* User signs transaction
* Submit to Stellar network
* Verify on backend
* Confirm order after verification

---

# ⭐ Stellar Integration

## Network Configuration

```js
import { Horizon, Networks } from "stellar-sdk";

const server = new Horizon.Server("https://horizon-testnet.stellar.org");

const networkPassphrase = Networks.TESTNET; 
```

---

## 💰 Payment Flow

1. User taps **Checkout**
2. Backend creates a **payment intent**
3. Backend returns:

   * Destination address
   * Amount
   * Memo (order ID)
4. User signs transaction
5. Transaction submitted to Stellar
6. Backend verifies:

   * Transaction hash
   * Destination
   * Memo
   * Amount
7. Order marked as **PAID**

---

## 🔄 Example Payment Verification

```js
const tx = await server.transactions().transaction(txHash).call();

if (
  tx.memo === orderId &&
  tx.successful
) {
  // Mark order as paid
}
```

---

# 📦 Installation

## 1️⃣ Clone Repo

```bash
git clone https://github.com/your-username/discoverly.git
cd discoverly
```

---

## 2️⃣ Backend Setup

```bash
cd backend
npm install
```

Create `.env`:

```
PORT=5000
MONGO_URI=
JWT_SECRET=
STELLAR_SECRET_KEY=
STELLAR_NETWORK=testnet
```

Run:

```bash
npm run dev
```

---

## 3️⃣ Mobile Setup

```bash
cd mobile
npm install
npx expo start
```

Update API base URL inside config.

---

# 🔐 Environment Variables

### Backend

| Variable           | Description               |
| ------------------ | ------------------------- |
| PORT               | API port                  |
| MONGO_URI          | MongoDB connection string |
| JWT_SECRET         | Auth signing secret       |
| STELLAR_SECRET_KEY | Server wallet secret      |
| STELLAR_NETWORK    | testnet / public          |

---

# 📲 Swipe Logic

Food cards are fetched from:

```
GET /api/foods/discover
```

Swipe Right:

```
POST /api/match
```

Creates:

* Match record
* Adds to cart

Swipe Left:

* No persistence (optional tracking)

---

# 🧠 Order Flow

```
Swipe → Match → Cart → Checkout → Stellar Payment → Verification → Order Confirmed
```

Order statuses:

* PENDING
* AWAITING_PAYMENT
* PAID
* PREPARING
* COMPLETED
* CANCELLED

---

# 🔎 Security Considerations

* Never expose server secret key
* Verify all Stellar transactions on backend
* Validate memo & amount
* Use HTTPS in production
* Use rate limiting on payment endpoints
* Consider multi-sig for restaurant wallets (future improvement)

---

# 🌍 Deployment

### Backend

* AWS / Railway / Render / DigitalOcean
* Use production Stellar network
* Secure environment variables

### Mobile

* Expo EAS build
* App Store / Play Store deployment

---

# 🔮 Future Improvements

* Non-custodial wallet integration
* QR payment support
* Restaurant analytics dashboard
* Stablecoin support (USDC on Stellar)
* Subscription meal plans
* On-chain loyalty points

---

# 🧪 Testing

Use Stellar Testnet:

* Fund accounts via Friendbot
* Switch to PUBLIC only in production

---

# 🤝 Contributing

1. Fork the repo
2. Create feature branch
3. Commit changes
4. Open PR

Please follow:

* Clean commit messages
* Consistent code style
* Proper API documentation

---

# 📜 License

MIT License

---

# 💡 Vision

Discoverly combines the addictive swipe UX of modern dating apps with the power of blockchain-based payments to create a frictionless, borderless food discovery experience.

Food meets finance.
Discovery meets decentralization.

