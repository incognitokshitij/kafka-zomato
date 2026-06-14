# kafka-zomato

A small Kafka demo modeled on a Zomato-style rider tracking flow. A **producer** simulates a delivery rider streaming GPS coordinates every 2 seconds to a Kafka topic. Two independent **consumers** read the same stream for different purposes — one mimics a customer's live map UI, the other an analytics pipeline.

It's a hands-on example of Kafka's **pub/sub fan-out**: one producer, many consumer groups, each getting a full copy of the messages.

---

## Architecture

```
                                    ┌──────────────────────┐
                                    │  consumer-user.js    │
                              ┌────▶│  (group: user-ui)    │
                              │     │  "live map view"     │
┌──────────────┐    ┌──────┐  │     └──────────────────────┘
│ producer.js  │───▶│Kafka │──┤
│ rider GPS    │    │topic │  │     ┌──────────────────────┐
└──────────────┘    └──────┘  └────▶│ consumer-analytics.js│
                                    │ (group: analytics)   │
                                    │ "heatmap / metrics"  │
                                    └──────────────────────┘
```

- **Topic:** `rider_location`
- **Message shape:** `{ riderId, lat, lng, timestamp }`
- Each consumer is in a **different consumer group**, so both receive every message independently.

---

## Tech stack

- **Node.js**
- **[kafkajs](https://kafka.js.org/)** — Kafka client for Node
- **Confluent Kafka + Zookeeper** (via Docker Compose)
- **concurrently** — runs producer + both consumers in one terminal

---

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (running)
- [Node.js](https://nodejs.org/) v16+
- npm

---

## Setup

Clone the repo and install dependencies:

```bash
git clone https://github.com/<your-username>/kafka-zomato.git
cd kafka-zomato
npm install
```

---

## How to run

### 1. Start Kafka + Zookeeper

```bash
docker compose up -d
```

Verify both containers are healthy:

```bash
docker ps
```

You should see `kafka-zomato-kafka-1` and `kafka-zomato-zookeeper-1` running, with Kafka exposed on `localhost:9092`.

### 2. Create the topic (one-time)

```bash
npm run admin
```

This creates the `rider_location` topic and prints the list of topics.

### 3. Start the producer + consumers

```bash
npm start
```

This launches three processes concurrently:
- `producer.js` — emits a fake rider location every 2 seconds
- `consumer-user.js` — consumes as the "user UI"
- `consumer-analytics.js` — consumes as the "analytics" service

You'll see output like:

```
🛵 Rider connected...
📍 Location sent: { riderId: 'rider_123', lat: 12.97..., lng: 77.59..., timestamp: ... }
🖥️  User UI received: { riderId: 'rider_123', ... }
📊 Analytics received: { riderId: 'rider_123', ... }
```

Both consumers receive the **same** message because they belong to different consumer groups.

---

## Stopping everything

Stop the Node processes with `Ctrl+C`, then bring the Kafka stack down:

```bash
docker compose down
```

---

## Project structure

```
kafka-zomato/
├── admin.js               # creates the 'rider_location' topic
├── producer.js            # simulates rider GPS stream
├── consumer-user.js       # consumer group: user-ui-group
├── consumer-analytics.js  # consumer group: analytics-group
├── docker-compose.yml     # Kafka + Zookeeper (Confluent 7.4.4)
├── package.json
└── README.md
```

---

## NPM scripts

| Command         | What it does                                                |
|-----------------|-------------------------------------------------------------|
| `npm run admin` | Creates the `rider_location` topic                          |
| `npm start`     | Runs the producer + both consumers concurrently             |

---

## Troubleshooting

**Kafka container exits with `KAFKA_PROCESS_ROLES is not set`**
You're on a newer (KRaft-only) image. This repo pins Confluent **7.4.4** in `docker-compose.yml` for Zookeeper-mode compatibility — make sure you didn't change it to `latest`.

**`ECONNREFUSED 127.0.0.1:9092`**
Kafka isn't up yet. Wait ~10 seconds after `docker compose up -d` for it to finish booting, or check `docker logs kafka-zomato-kafka-1`.

**Topic already exists error from `admin.js`**
Safe to ignore — it just means you already ran it.

---

## License

ISC
