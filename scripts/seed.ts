import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'
import 'dotenv/config'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 10)
  const driverPassword = await bcrypt.hash('driver123', 10)

  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: adminPassword,
      role: 'ADMIN',
    },
  })

  const driver = await prisma.user.upsert({
    where: { username: 'driver' },
    update: {},
    create: {
      username: 'driver',
      password: driverPassword,
      role: 'DRIVER',
    },
  })

  console.log({ admin, driver })
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
