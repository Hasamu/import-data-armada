import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'DRIVER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { driverName, plateNumber, bbm, odoMeter, deliveryReport } = await request.json()

    if (!driverName || !plateNumber || bbm == null || odoMeter == null || !deliveryReport) {
      return NextResponse.json({ error: 'Semua field harus diisi' }, { status: 400 })
    }

    const report = await prisma.report.create({
      data: {
        driverName,
        plateNumber,
        bbm: parseFloat(bbm),
        odoMeter: parseInt(odoMeter, 10),
        deliveryReport,
      },
    })

    return NextResponse.json({ message: 'Laporan berhasil disimpan', report }, { status: 201 })
  } catch (error) {
    console.error('Error creating report:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const reports = await prisma.report.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(reports)
  } catch (error) {
    console.error('Error fetching reports:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
