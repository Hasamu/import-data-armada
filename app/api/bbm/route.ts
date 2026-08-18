import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  
  if (!session || (session.role !== 'ADMIN' && session.role !== 'MANAGEMENT')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const reports = await prisma.bbmReport.findMany({
      orderBy: { waktu_upload: 'desc' },
    })
    return NextResponse.json(reports)
  } catch (error) {
    console.error('Error GET BBM:', error)
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
    const { idUnit, tanggalBbm, waktu, spbu, kotaKabupaten, jenis, volume, totalBayar } = body

    const newReport = await prisma.bbmReport.create({
      data: {
        id_unit: idUnit,
        tanggal_bbm: new Date(tanggalBbm),
        waktu,
        spbu,
        kota_kab: kotaKabupaten,
        jenis,
        liter: Number(volume),
        total_bayar: Number(totalBayar),
        submittedBy: session.username,
      },
    })

    return NextResponse.json(newReport, { status: 201 })
  } catch (error) {
    console.error('Error saving BBM:', error)
    return NextResponse.json({ error: 'Gagal menyimpan laporan BBM' }, { status: 500 })
  }
}
