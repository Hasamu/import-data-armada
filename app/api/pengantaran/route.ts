import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  
  if (!session || (session.role !== 'ADMIN' && session.role !== 'MANAGEMENT')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const reports = await prisma.pengantaranReport.findMany({
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
    const { 
      idUnit, 
      tanggal, 
      trip, 
      startLoading, 
      endLoading, 
      startPengantaran,
      finishPengantaran,
      suksesKirim, 
      gagalKirim, 
      omset,
      catatan
    } = body

    const suksesKirimInt = parseInt(suksesKirim, 10)
    const gagalKirimInt = parseInt(gagalKirim, 10)
    const omsetFloat = parseFloat(omset)

    if (isNaN(suksesKirimInt) || isNaN(gagalKirimInt) || isNaN(omsetFloat)) {
      return NextResponse.json({ error: 'Format angka tidak valid' }, { status: 400 })
    }

    const totalPengantaran = suksesKirimInt + gagalKirimInt

    const newReport = await prisma.pengantaranReport.create({
      data: {
        idUnit,
        tanggal: new Date(tanggal),
        namaDriver: session.username,
        trip,
        startLoading,
        endLoading,
        startPengantaran,
        finishPengantaran,
        totalPengantaran,
        suksesKirim: suksesKirimInt,
        gagalKirim: gagalKirimInt,
        omset: omsetFloat,
        catatan,
        submittedBy: session.username,
      },
    })

    return NextResponse.json(newReport, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menyimpan laporan Pengantaran' }, { status: 500 })
  }
}
