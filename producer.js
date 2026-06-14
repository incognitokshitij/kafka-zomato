const { Kafka } = require('kafkajs')

const kafka = new Kafka({ brokers: ['localhost:9092'] })
const producer = kafka.producer()

const run = async () => {
    await producer.connect()
    console.log('🛵 Rider connected...')

    setInterval(async () => {
        const location = {
            riderId: 'rider_123',
            lat: 12.9716 + Math.random() * 0.01,
            lng: 77.5946 + Math.random() * 0.01,
            timestamp: Date.now()
        }

        await producer.send({
            topic: 'rider_location',
            messages: [{ value: JSON.stringify(location) }]
        })

        console.log('📍 Location sent:', location)
    }, 2000)
}

run()