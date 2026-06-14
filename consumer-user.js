const { Kafka } = require('kafkajs')

const kafka = new Kafka({ brokers: ['localhost:9092'] })
const consumer = kafka.consumer({ groupId: 'user-ui-group' })

const run = async () => {
  await consumer.connect()
  await consumer.subscribe({ topic: 'rider_location', fromBeginning: false })

  await consumer.run({
    eachMessage: async ({ message }) => {
      const location = JSON.parse(message.value.toString())
      console.log('🖥️  User UI received:', location)
    }
  })
}

run()