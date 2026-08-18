import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getSession()
  
  if (!session || !session.username) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  
  // Untuk rekap bulanan
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
  
  // Untuk trend 7 hari ke belakang
  const sevenDaysAgo = new Date(now.getTime() - (6 * 24 * 60 * 60 * 1000))
  sevenDaysAgo.setHours(0, 0, 0, 0)

  try {
    const driverName = session.username

    // 1. BBM (Biaya)
    const bbmData: any = await prisma.$queryRaw`
      SELECT SUM(total_bayar) as total 
      FROM "BbmReport" 
      WHERE "submittedBy" ILIKE ${driverName}
        AND tanggal_bbm >= ${startOfMonth} 
        AND tanggal_bbm <= ${endOfMonth}
    `

    // 2. Kilometer (Total Penambahan KM)
    const kmData: any = await prisma.$queryRaw`
      SELECT SUM("totalKm") as total 
      FROM "KilometerReport" 
      WHERE "driverName" ILIKE ${driverName}
        AND tanggal >= ${startOfMonth} 
        AND tanggal <= ${endOfMonth}
    `

    // 3. Pengantaran (Rekap Bulanan)
    const pengantaranData: any = await prisma.$queryRaw`
      SELECT 
        SUM("suksesKirim") as sukses, 
        SUM("gagalKirim") as gagal, 
        SUM("omset") as omset 
      FROM "PengantaranReport" 
      WHERE ("submittedBy" ILIKE ${driverName} OR "namaDriver" ILIKE ${driverName})
        AND tanggal >= ${startOfMonth} 
        AND tanggal <= ${endOfMonth}
    `

    // 4. Pengantaran (Raw Data 7 Hari Terakhir untuk Trend)
    const pengantaranRaw: any = await prisma.$queryRaw`
      SELECT 
        tanggal, 
        "suksesKirim", 
        "gagalKirim", 
        "omset" 
      FROM "PengantaranReport" 
      WHERE ("submittedBy" ILIKE ${driverName} OR "namaDriver" ILIKE ${driverName})
        AND tanggal >= ${sevenDaysAgo}
    `

    // Proses data harian
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
    const trendMap = new Map()
    
    // Inisialisasi 7 hari terakhir (dari 6 hari lalu sampai hari ini)
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000))
      // Sesuaikan offset +7 jam secara manual untuk representasi GMT+7 agar nama harinya akurat
      const gmt7Date = new Date(d.getTime() + (7 * 60 * 60 * 1000))
      const dayName = days[gmt7Date.getUTCDay()]
      const dateStr = `${gmt7Date.getUTCFullYear()}-${String(gmt7Date.getUTCMonth() + 1).padStart(2, '0')}-${String(gmt7Date.getUTCDate()).padStart(2, '0')}`
      
      trendMap.set(dateStr, { name: dayName, dateStr, omset: 0 })
    }

    let omsetHariIni = 0
    let suksesHariIni = 0
    let gagalHariIni = 0
    
    // Base untuk hari ini di GMT+7
    const gmt7Now = new Date(now.getTime() + (7 * 60 * 60 * 1000))
    const todayStr = `${gmt7Now.getUTCFullYear()}-${String(gmt7Now.getUTCMonth() + 1).padStart(2, '0')}-${String(gmt7Now.getUTCDate()).padStart(2, '0')}`

    pengantaranRaw.forEach((row: any) => {
      const rowDate = new Date(row.tanggal)
      const gmt7RowDate = new Date(rowDate.getTime() + (7 * 60 * 60 * 1000))
      const rowDateStr = `${gmt7RowDate.getUTCFullYear()}-${String(gmt7RowDate.getUTCMonth() + 1).padStart(2, '0')}-${String(gmt7RowDate.getUTCDate()).padStart(2, '0')}`

      if (trendMap.has(rowDateStr)) {
        const existing = trendMap.get(rowDateStr)
        existing.omset += Number(row.omset || 0)
      }

      if (rowDateStr === todayStr) {
        omsetHariIni += Number(row.omset || 0)
        suksesHariIni += Number(row.suksesKirim || 0)
        gagalHariIni += Number(row.gagalKirim || 0)
      }
    })

    const trendMingguan = Array.from(trendMap.values())

    return NextResponse.json({
      bbm: {
        totalBiaya: Number(bbmData[0]?.total || 0)
      },
      kilometer: {
        totalKm: Number(kmData[0]?.total || 0)
      },
      pengantaran: {
        sukses: Number(pengantaranData[0]?.sukses || 0),
        gagal: Number(pengantaranData[0]?.gagal || 0),
        omset: Number(pengantaranData[0]?.omset || 0),
        hariIni: {
          sukses: suksesHariIni,
          gagal: gagalHariIni,
          omset: omsetHariIni
        }
      },
      trendMingguan,
      driverName: driverName
    })
  } catch (error) {
    console.error('Error fetching driver progress:', error)
    return NextResponse.json({ error: 'Gagal mengambil data progress' }, { status: 500 })
  }
}
