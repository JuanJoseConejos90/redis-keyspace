# Azure Functions – Redis Expiration & Cosmos DB Integration

This project is an **Azure Functions (Node.js)** application that demonstrates:

* Creating customer sessions via **HTTP POST**
* Storing session data in **Azure Cosmos DB (SQL API)**
* Managing session lifecycle with **Redis TTL**
* Detecting **Redis key expiration events** using **Keyspace Notifications**
* Handling **pre-expiration events (≈1 minute before expiry)**
* Running **locally** with Cosmos DB Emulator and Redis
* Unit testing with **Redis mocks**

The solution is designed to be **production-ready**, **scalable**, and **Azure-friendly**.

---

## 🏗️ Architecture Overview

```
HTTP POST
   │
   ├── Azure Function (Node.js)
   │     ├── Save session to Cosmos DB
   │     └── Create Redis session + reminder key
   │
Redis (TTL)
   │
   └── Keyspace Notifications (Ex)
         └── Azure Function Redis Subscriber
               └── Pre-expiration handling (~1 min before)
```

---

## 🚀 Features

* ✅ Azure Functions v4 (Node.js)
* ✅ Redis Keyspace Notifications (`Ex`)
* ✅ Pre-expiration pattern using reminder keys
* ✅ Cosmos DB SQL API integration
* ✅ Singleton Redis & Cosmos clients
* ✅ Idempotent & scalable design
* ✅ Local development support
* ✅ Unit testing with mocked Redis

---

## 📁 Project Structure

```
/src
 ├── cosmosClient.ts          # Cosmos DB singleton client
 ├── redisClient.ts           # Redis singleton + expiration listener
 ├── Models
 │    └── Utils.ts
 └── functions
      ├── createSession.ts    # HTTP POST – create Redis session
      └── saveCustomerSession.ts # HTTP POST – save data to Cosmos DB

/__tests__
 ├── redisClient.test.ts
 └── createSession.test.ts

local.settings.json
README.md
```

---

## ⚙️ Environment Variables

### Azure / Local Settings

```env
APP_REDIS_HOST=localhost
APP_REDIS_PORT=6379
APP_REDIS_DELAY=300

COSMOS_ENDPOINT=https://localhost:8081/
COSMOS_KEY=<primary-key>
COSMOS_DATABASE=customerdb
COSMOS_CONTAINER=sessions
```

> ⚠️ Never commit real keys to source control.

---

## 🗄️ Cosmos DB Configuration

| Setting       | Value              |
| ------------- | ------------------ |
| API           | Core (SQL)         |
| Database      | customerdb         |
| Container     | sessions           |
| Partition Key | /customerSessionId |
| Throughput    | Autoscale          |

Cosmos DB Emulator is recommended for local development.

---

## 🔔 Redis Expiration Strategy

### Keys

```
session:{sessionId}        → Main session key (TTL)
reminder:{sessionId}       → Pre-expiration key (TTL - 60s)
```

### Why this approach?

* Redis does **not** support "before expire" events
* Reminder keys provide deterministic pre-expiration handling
* Scales to millions of keys

---

## 🔥 Redis Keyspace Notifications

Enabled once at startup:

```bash
CONFIG SET notify-keyspace-events Ex
```

Subscribed channel:

```
__keyevent@0__:expired
```

Handled in a **singleton Redis subscriber**.

---

## 📡 HTTP Endpoints

### 1️⃣ Create Session

```
POST /api/createSession
```

Creates:

* Redis session key
* Redis reminder key

---

### 2️⃣ Save Customer Session

```
POST /api/saveCustomerSession
```

Sample payload:

```json
{
  "customerSessionId": "e1641a95-4221-4faa-8c63-fb0c250e8b29",
  "name": "JuanJose",
  "lastName": "Conejo",
  "secondLastName": "Sanabria",
  "ip": "127.0.0.1",
  "isIndependent": false,
  "ingressCurrency": 1
}
```

---

## 🧪 Unit Testing

Redis is mocked using **ioredis-mock**.

```bash
npm test
```

### Notes

* Redis Keyspace Notifications are **not** emitted by mocks
* Expiration handlers are tested directly
* Integration tests should use real Redis

---

## 🛠️ Local Development

### Start Redis (Docker)

```bash
docker run -p 6379:6379 redis
```

### Start Cosmos DB Emulator

* Install Cosmos DB Emulator (Windows)
* Endpoint: [https://localhost:8081/](https://localhost:8081/)

### Run Azure Functions

```bash
func start
```

---

## ⚠️ Important Azure Notes

* `WEBSITE_ALWAYS_ON=true` is required for Redis subscribers
* Use a **single subscriber** instance
* Avoid SCAN / TTL polling
* Prefer `upsert` for Cosmos DB writes

---

## 🚫 Known Limitations

* Redis Pub/Sub is best-effort
* Expiration events are not guaranteed
* Not suitable for financial or exactly-once workflows

---

## 🏆 Best Practices Applied

* Singleton connections
* Prefix-based key routing
* TTL jitter to avoid spikes
* Fail-fast error handling
* Idempotent logic

---

## 📌 Future Improvements

* Managed Identity for Cosmos DB
* Application Insights telemetry
* Distributed locking
* Redis Cluster support
* Schema validation (Zod/Joi)

---

## 👨‍💻 Author

**Juan Conejo**
Full Stack Developer – Azure | .NET | Node.js | Redis | Cosmos DB

---

## 📄 License

MIT License
