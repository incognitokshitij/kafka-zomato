const { Kafka } = require('kafkajs')

const kafka = new Kafka({ brokers: ['localhost:9092'] })
const admin = kafka.admin()

const run = async () => {
    await admin.connect()
    console.log('✅ Admin connected to Kafka')

    await admin.createTopics({
        topics: [
            {
                topic: 'rider_location',
                numPartitions: 1,
                replicationFactor: 1
            }
        ]
    })
    console.log('✅ Topic created: rider_location')

    const topics = await admin.listTopics()
    console.log('📋 All topics:', topics)

    await admin.disconnect()
    console.log('✅ Admin disconnected')
}

run()