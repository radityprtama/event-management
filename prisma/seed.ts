import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@eventplatform.com' },
    update: {},
    create: {
      email: 'admin@eventplatform.com',
      name: 'Admin User',
      passwordHash: adminPassword,
      role: 'ADMIN'
    }
  })

  // Create regular users
  const userPassword = await bcrypt.hash('user123', 12)
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'john@example.com' },
      update: {},
      create: {
        email: 'john@example.com',
        name: 'John Doe',
        passwordHash: userPassword,
        role: 'USER'
      }
    }),
    prisma.user.upsert({
      where: { email: 'jane@example.com' },
      update: {},
      create: {
        email: 'jane@example.com',
        name: 'Jane Smith',
        passwordHash: userPassword,
        role: 'USER'
      }
    }),
    prisma.user.upsert({
      where: { email: 'mike@example.com' },
      update: {},
      create: {
        email: 'mike@example.com',
        name: 'Mike Johnson',
        passwordHash: userPassword,
        role: 'USER'
      }
    })
  ])

  console.log('👥 Created users')

  // Create events
  const now = new Date()
  const events = [
    {
      title: 'Tech Conference 2024',
      description: 'Join us for the biggest tech conference of the year! Learn about the latest trends in AI, blockchain, and web development.',
      date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
      location: 'Jakarta Convention Center',
      capacity: 500,
      price: 150,
      createdBy: admin.id
    },
    {
      title: 'Startup Networking Event',
      description: 'Connect with fellow entrepreneurs and investors in this exclusive networking event.',
      date: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
      location: 'Coworking Space Menteng',
      capacity: 100,
      price: 0,
      createdBy: users[0].id
    },
    {
      title: 'Photography Workshop',
      description: 'Learn professional photography techniques from industry experts.',
      date: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000), // 3 weeks from now
      location: 'Taman Suropati',
      capacity: 30,
      price: 75,
      createdBy: users[1].id
    },
    {
      title: 'Digital Marketing Masterclass',
      description: 'Master the art of digital marketing with hands-on workshops and case studies.',
      date: new Date(now.getTime() + 28 * 24 * 60 * 60 * 1000), // 4 weeks from now
      location: 'Hotel Mulia Jakarta',
      capacity: 200,
      price: 200,
      createdBy: admin.id
    },
    {
      title: 'Open Source Meetup',
      description: 'Discuss the latest in open source projects and contribute to the community.',
      date: new Date(now.getTime() + 35 * 24 * 60 * 60 * 1000), // 5 weeks from now
      location: 'Universitas Indonesia',
      capacity: 80,
      price: 0,
      createdBy: users[2].id
    },
    {
      title: 'Food Festival Jakarta',
      description: 'Taste the best culinary delights from around Indonesia and the world.',
      date: new Date(now.getTime() + 42 * 24 * 60 * 60 * 1000), // 6 weeks from now
      location: 'Gelora Bung Karno',
      capacity: 1000,
      price: 25,
      createdBy: admin.id
    }
  ]

  const createdEvents = await Promise.all(
    events.map(event =>
      prisma.event.create({
        data: event
      })
    )
  )

  console.log('🎉 Created events')

  // Create participants for events
  const participantData = [
    // Tech Conference participants
    { userId: users[0].id, eventId: createdEvents[0].id, status: 'CONFIRMED' },
    { userId: users[1].id, eventId: createdEvents[0].id, status: 'REGISTERED' },
    { userId: users[2].id, eventId: createdEvents[0].id, status: 'CONFIRMED' },

    // Startup Networking participants
    { userId: users[1].id, eventId: createdEvents[1].id, status: 'CONFIRMED' },
    { userId: users[2].id, eventId: createdEvents[1].id, status: 'REGISTERED' },

    // Photography Workshop participants
    { userId: users[0].id, eventId: createdEvents[2].id, status: 'REGISTERED' },
    { userId: users[2].id, eventId: createdEvents[2].id, status: 'CONFIRMED' },

    // Digital Marketing participants
    { userId: users[0].id, eventId: createdEvents[3].id, status: 'REGISTERED' },
    { userId: users[1].id, eventId: createdEvents[3].id, status: 'CONFIRMED' },

    // Open Source Meetup participants
    { userId: users[0].id, eventId: createdEvents[4].id, status: 'CONFIRMED' },
    { userId: users[1].id, eventId: createdEvents[4].id, status: 'REGISTERED' },
    { userId: users[2].id, eventId: createdEvents[4].id, status: 'CONFIRMED' },

    // Food Festival participants
    { userId: users[0].id, eventId: createdEvents[5].id, status: 'REGISTERED' },
    { userId: users[1].id, eventId: createdEvents[5].id, status: 'REGISTERED' },
  ]

  await Promise.all(
    participantData.map(participant =>
      prisma.participant.create({
        data: participant
      })
    )
  )

  console.log('✅ Created participants')

  console.log('🎯 Seed completed successfully!')
  console.log(`
📧 Admin login: admin@eventplatform.com / admin123
📧 User login: john@example.com / user123
📧 User login: jane@example.com / user123
📧 User login: mike@example.com / user123
  `)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })