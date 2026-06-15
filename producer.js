const { Kafka } = require('kafkajs')

const kafka = new Kafka({ brokers: ['localhost:9092'] })
const producer = kafka.producer()

const run = async () => {
    try {
        await producer.connect()
        console.log('🛵 Rider connected...')

        setInterval(async () => {
            const location = {
                riderId: 'rider_123',
                lat: 12.9716 + Math.random() * 0.01,
                lng: 77.5946 + Math.random() * 0.01,
                timestamp: Date.now()
            }

            try {
                await producer.send({
                    topic: 'rider_location',
                    messages: [{ value: JSON.stringify(location) }]
                })
                console.log('📍 Location sent:', location)
            } catch (err) {
                console.error('❌ Send failed:', err.message)
            }
        }, 2000)
    } catch (err) {
        console.error('❌ Producer connect failed:', err.message)
        process.exit(1)
    }
}

const shutdown = async () => {
    console.log('\n👋 Disconnecting producer...')
    try {
        await producer.disconnect()
    } catch (err) {
        console.error('❌ Disconnect error:', err.message)
    }
    process.exit(0)
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)

run().catch(err => {
    console.error('❌ Fatal:', err)
    process.exit(1)
})