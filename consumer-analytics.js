const { Kafka } = require('kafkajs')

const kafka = new Kafka({ brokers: ['localhost:9092'] })
const consumer = kafka.consumer({ groupId: 'analytics-group' })

const run = async () => {
    try {
        await consumer.connect()
        await consumer.subscribe({ topic: 'rider_location', fromBeginning: false })

        await consumer.run({
            eachMessage: async ({ message }) => {
                try {
                    const location = JSON.parse(message.value.toString())
                    console.log('📊 Analytics received:', location)
                } catch (err) {
                    console.error('❌ Bad message:', err.message)
                }
            }
        })
    } catch (err) {
        console.error('❌ Consumer failed:', err.message)
        process.exit(1)
    }
}

const shutdown = async () => {
    console.log('\n👋 Disconnecting analytics consumer...')
    try {
        await consumer.disconnect()
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