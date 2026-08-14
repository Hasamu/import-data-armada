import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const reports = await prisma.kilometerReport.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(reports)
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil data' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getSession()
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { idUnit, tanggal, kmAwal, kmAkhir } = body

    const kmAwalFloat = parseFloat(kmAwal)
    const kmAkhirFloat = parseFloat(kmAkhir)

    if (isNaN(kmAwalFloat) || isNaN(kmAkhirFloat)) {
      return NextResponse.json({ error: 'KM Awal dan KM Akhir harus berupa angka' }, { status: 400 })
    }

    const totalKm = kmAkhirFloat - kmAwalFloat

    if (totalKm < 0) {
      return NextResponse.json({ error: 'KM Akhir tidak boleh lebih kecil dari KM Awal' }, { status: 400 })
    }

    const newReport = await prisma.kilometerReport.create({
      data: {
        idUnit,
        tanggal: new Date(tanggal),
        kmAwal: kmAwalFloat,
        kmAkhir: kmAkhirFloat,
        totalKm,
        driverName: session.username,
      },
    })

    return NextResponse.json(newReport, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menyimpan laporan Kilometer' }, { status: 500 })
  }
}
