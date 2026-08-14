import prisma from './lib/prisma'

async function main() {
  try {
    const res = await prisma.bbmReport.findMany()
    console.log(res)
  } catch (e) {
    console.error(e)
  } finally {
    process.exit(0)
  }
}

main()
