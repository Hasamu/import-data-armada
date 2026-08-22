'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import * as XLSX from 'xlsx'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

interface Report {
  id: string
  driverName: string
  plateNumber: string
  bbm: number
  odoMeter: number
  deliveryReport: string
  createdAt: string
}

interface BbmReport {
  id: string
  id_unit: string
  tanggal_bbm: string
  waktu: string
  spbu: string | null
  kota_kab: string
  jenis: string
  liter: number
  total_bayar: number
  waktu_upload: string
}

interface KilometerReport {
  id: string
  idUnit: string
  tanggal: string
  kmAwal: number
  kmAkhir: number
  totalKm: number
  driverName: string
  createdAt: string
}

export default function AdminPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [bbmReports, setBbmReports] = useState<any[]>([])
  const [kmReports, setKmReports] = useState<any[]>([])
  const [pengantaranReports, setPengantaranReports] = useState<any[]>([])
  const [armadaList, setArmadaList] = useState<any[]>([])
  const [driverList, setDriverList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeMenu, setActiveMenu] = useState<'DASHBOARD' | 'BBM' | 'KILOMETER' | 'PENGANTARAN' | 'STATUS_DRIVER' | 'PENGATURAN'>('DASHBOARD')
  const [newIdUnit, setNewIdUnit] = useState('')
  const [newDriverName, setNewDriverName] = useState('')
  const [newDriverPassword, setNewDriverPassword] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [dateRange, setDateRange] = useState('30_days')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [userRole, setUserRole] = useState('')
  const [statusDriverDate, setStatusDriverDate] = useState(() => new Date().toISOString().split('T')[0])
  const router = useRouter()

  const handleAddArmada = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/armada', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idUnit: newIdUnit })
      })
      if (res.ok) {
        setNewIdUnit('')
        fetchData()
      } else {
        const data = await res.json()
        setError(data.error || 'Gagal menambah armada')
      }
    } catch (err) {
      setError('Terjadi kesalahan')
    }
  }

  const handleDeleteArmada = async (id: string) => {
    try {
      const res = await fetch(`/api/armada/${id}`, { method: 'DELETE' })
      if (res.ok) fetchData()
    } catch (err) {
      setError('Gagal menghapus armada')
    }
  }

  const handleAddDriver = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: newDriverName, password: newDriverPassword })
      })
      if (res.ok) {
        setNewDriverName('')
        setNewDriverPassword('')
        fetchData()
      } else {
        const data = await res.json()
        setError(data.error || 'Gagal menambah driver')
      }
    } catch (err) {
      setError('Terjadi kesalahan')
    }
  }

  const handleDeleteDriver = async (id: string) => {
    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' })
      if (res.ok) fetchData()
    } catch (err) {
      setError('Gagal menghapus driver')
    }
  }

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch('/api/auth/session')
        if (res.ok) {
          const session = await res.json()
          setUserRole(session.role || '')
        }
      } catch (err) {
        console.error('Failed to fetch session', err)
      }
    }
    fetchSession()
    fetchData()
  }, [])

  useEffect(() => {
    const today = new Date()
    let start = '';
    let end = today.toISOString().split('T')[0];

    if (dateRange === 'today') {
      start = end;
    } else if (dateRange === '7_days') {
      const d = new Date(today); d.setDate(d.getDate() - 7);
      start = d.toISOString().split('T')[0];
    } else if (dateRange === '30_days') {
      const d = new Date(today); d.setDate(d.getDate() - 30);
      start = d.toISOString().split('T')[0];
    } else if (dateRange === 'this_month') {
      const d = new Date(today.getFullYear(), today.getMonth(), 1);
      start = d.toISOString().split('T')[0];
      const dEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      end = dEnd.toISOString().split('T')[0];
    } else if (dateRange === 'last_month') {
      const dStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const dEnd = new Date(today.getFullYear(), today.getMonth(), 0);
      start = dStart.toISOString().split('T')[0];
      end = dEnd.toISOString().split('T')[0];
    } else if (dateRange === 'all_time') {
      start = '';
      end = '';
    }

    setStartDate(start);
    setEndDate(end);
  }, [dateRange])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [resReports, resBbm, resKm, resPengantaran, resArmada, resUsers] = await Promise.all([
        fetch('/api/reports'),
        fetch('/api/bbm'),
        fetch('/api/kilometer'),
        fetch('/api/pengantaran'),
        fetch('/api/armada'),
        fetch('/api/users')
      ])
      
      if (resReports.ok && resBbm.ok && resKm.ok && resPengantaran.ok && resArmada.ok && resUsers.ok) {
        setReports(await resReports.json())
        setBbmReports(await resBbm.json())
        setKmReports(await resKm.json())
        setPengantaranReports(await resPengantaran.json())
        setArmadaList(await resArmada.json())
        setDriverList(await resUsers.json())
      } else {
        if (resReports.status === 401 || resBbm.status === 401 || resKm.status === 401 || resPengantaran.status === 401) {
          router.push('/login')
        }
        setError('Gagal mengambil data laporan')
      }
    } catch (err) {
      setError('Kesalahan jaringan saat mengambil data')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  // Helper to check if a date is within the range
  const isWithinDateRange = (dateString: string) => {
    if (!startDate && !endDate) return true
    
    const date = new Date(dateString)
    date.setHours(0, 0, 0, 0)
    
    if (startDate) {
      const start = new Date(startDate)
      start.setHours(0, 0, 0, 0)
      if (date < start) return false
    }
    if (endDate) {
      const end = new Date(endDate)
      end.setHours(0, 0, 0, 0)
      if (date > end) return false
    }
    return true
  }

  const filteredBbm = bbmReports.filter(r => isWithinDateRange(r.tanggal_bbm))
  const filteredKm = kmReports.filter(r => isWithinDateRange(r.tanggal))
  const filteredPengantaran = pengantaranReports.filter(r => isWithinDateRange(r.tanggal))

  // --- Dashboard Calculations ---
  const totalOmset = filteredPengantaran.reduce((sum, r) => sum + (Number(r.omset) || 0), 0)
  const totalBbm = filteredBbm.reduce((sum, r) => sum + (Number(r.total_bayar) || 0), 0)
  const labaKotor = totalOmset - totalBbm
  const totalSukses = filteredPengantaran.reduce((sum, r) => sum + (Number(r.suksesKirim) || 0), 0)
  const totalGagal = filteredPengantaran.reduce((sum, r) => sum + (Number(r.gagalKirim) || 0), 0)

  // Driver Leaderboard
  const driverStats = filteredPengantaran.reduce((acc: any, r: any) => {
    if (!acc[r.namaDriver]) {
      acc[r.namaDriver] = { namaDriver: r.namaDriver, totalTrip: 0, omset: 0, sukses: 0, gagal: 0 }
    }
    acc[r.namaDriver].totalTrip += 1
    acc[r.namaDriver].omset += Number(r.omset) || 0
    acc[r.namaDriver].sukses += Number(r.suksesKirim) || 0
    acc[r.namaDriver].gagal += Number(r.gagalKirim) || 0
    return acc
  }, {})
  const leaderboard = Object.values(driverStats).sort((a: any, b: any) => b.omset - a.omset)

  // Driver yang belum laporan (berdasarkan statusDriverDate)
  const pengantaranOnDate = pengantaranReports.filter((r: any) => {
    const rDate = new Date(r.tanggal)
    return !isNaN(rDate.getTime()) && rDate.toISOString().split('T')[0] === statusDriverDate
  })
  const submittedDriverUsernames = new Set(pengantaranOnDate.map((r: any) => r.submittedBy || r.namaDriver))
  const allDrivers = driverList.filter((u: any) => u.role !== 'ADMIN' && u.role !== 'MANAGEMENT')
  const unsubmittedDrivers = allDrivers.filter((u: any) => !submittedDriverUsernames.has(u.username))


  // Chart Data (Group by date)
  const chartDataRaw = filteredPengantaran.reduce((acc: any, r: any) => {
    const dateStr = new Date(r.tanggal).toISOString().split('T')[0]
    if (!acc[dateStr]) {
      acc[dateStr] = { dateRaw: dateStr, omset: 0, bbm: 0 }
    }
    acc[dateStr].omset += Number(r.omset) || 0
    return acc
  }, {})
  
  // Mix BBM into chart data
  filteredBbm.forEach((r: any) => {
    const dateStr = new Date(r.tanggal_bbm).toISOString().split('T')[0]
    if (!chartDataRaw[dateStr]) {
      chartDataRaw[dateStr] = { dateRaw: dateStr, omset: 0, bbm: 0 }
    }
    chartDataRaw[dateStr].bbm += Number(r.total_bayar) || 0
  })

  const chartData = Object.values(chartDataRaw)
    .sort((a: any, b: any) => new Date(a.dateRaw).getTime() - new Date(b.dateRaw).getTime())
    .map((item: any) => ({
      tanggal: new Date(item.dateRaw).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
      omset: item.omset,
      bbm: item.bbm
    }))
  // -----------------------------


  const exportToExcel = () => {
    if (activeMenu === 'BBM') {
      const data = filteredBbm.map((r, index) => ({
        No: index + 1,
        'ID Unit': r.id_unit,
        'Tanggal BBM': new Date(r.tanggal_bbm).toLocaleDateString('id-ID'),
        'Waktu': r.waktu,
        'SPBU': r.spbu || '-',
        'Kota/Kabupaten': r.kota_kab,
        'Jenis': r.jenis,
        'Volume(Liter)': r.liter,
        'Total Bayar': r.total_bayar,
      }))
      const ws = XLSX.utils.json_to_sheet(data)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, "BBM")
      XLSX.writeFile(wb, "Laporan_BBM.xlsx")
    } else if (activeMenu === 'KILOMETER') {
      const data = filteredKm.map((r, index) => ({
        No: index + 1,
        'ID Unit': r.idUnit,
        'Tanggal': new Date(r.tanggal).toLocaleDateString('id-ID'),
        'KM Awal': r.kmAwal,
        'KM Akhir': r.kmAkhir,
        'Total KM': r.totalKm,
      }))
      const ws = XLSX.utils.json_to_sheet(data)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, "Kilometer")
      XLSX.writeFile(wb, "Laporan_Kilometer.xlsx")
    } else if (activeMenu === 'PENGANTARAN') {
      const data = filteredPengantaran.map(r => ({
        'ID Unit': r.idUnit,
        'Tanggal': new Date(r.tanggal).toLocaleDateString('id-ID'),
        'Nama Driver': r.namaDriver,
        'Trip': r.trip,
        'Start Loading': r.startLoading,
        'End Loading': r.endLoading,
        'Start': r.startPengantaran || '-',
        'Finish': r.finishPengantaran || '-',
        'Total Pengantaran': r.totalPengantaran,
        'Sukses Kirim': r.suksesKirim,
        'Gagal Kirim': r.gagalKirim,
        'Omset': r.omset,
        'Catatan': r.catatan || '',
        'Submitted By': r.submittedBy,
        'Waktu Submit': new Date(r.createdAt).toLocaleString('id-ID')
      }))
      const ws = XLSX.utils.json_to_sheet(data)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, "Pengantaran")
      XLSX.writeFile(wb, "Laporan_Pengantaran.xlsx")
    }
  }

  const handleDeleteBbm = async (id: string) => {
    if (!confirm('Yakin ingin menghapus data BBM ini?')) return
    try {
      const res = await fetch(`/api/bbm/${id}`, { method: 'DELETE' })
      if (res.ok) fetchData()
      else setError('Gagal menghapus data')
    } catch (err) {
      setError('Kesalahan jaringan')
    }
  }

  const handleDeleteKm = async (id: string) => {
    if (!confirm('Yakin ingin menghapus data Kilometer ini?')) return
    try {
      const res = await fetch(`/api/kilometer/${id}`, { method: 'DELETE' })
      if (res.ok) fetchData()
      else setError('Gagal menghapus data')
    } catch (err) {
      setError('Kesalahan jaringan')
    }
  }

  const handleDeletePengantaran = async (id: string) => {
    if (!confirm('Yakin ingin menghapus data Pengantaran ini?')) return
    try {
      const res = await fetch(`/api/pengantaran/${id}`, { method: 'DELETE' })
      if (res.ok) fetchData()
      else setError('Gagal menghapus data')
    } catch (err) {
      setError('Kesalahan jaringan')
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-600">Loading data...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans relative">
      
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between bg-white p-4 border-b border-gray-100 sticky top-0 z-20 shadow-sm">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center mr-3 shadow-lg shadow-blue-500/30">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-black text-gray-900 tracking-tight leading-tight">Admin Panel</h2>
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Laporan Armada</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleLogout} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isSidebarOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-30 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <div className={`fixed inset-y-0 left-0 w-72 bg-white shadow-xl shadow-gray-200/50 flex flex-col z-40 border-r border-gray-100 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:w-72 md:min-h-screen md:sticky md:top-0 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="hidden md:flex p-6 md:p-8 border-b border-gray-100 items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center mr-3 shadow-lg shadow-blue-500/30">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight">Admin Panel</h2>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-0.5">Laporan Armada</p>
            </div>
          </div>
          <button onClick={handleLogout} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
        
        {/* Mobile Sidebar Header */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-gray-100">
           <div className="flex items-center">
             <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center mr-3 shadow-lg shadow-blue-500/30">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
             </div>
             <span className="font-bold text-gray-900">Menu Laporan</span>
           </div>
           <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 bg-gray-50 rounded-lg transition-colors">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
             </svg>
           </button>
        </div>

        <nav className="flex-1 p-4 md:p-5 flex flex-col space-y-2 overflow-y-auto scrollbar-hide">
          <p className="hidden md:block px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 mt-2">Menu Laporan</p>
          <button
            onClick={() => { setActiveMenu('DASHBOARD'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center px-4 py-3.5 text-sm font-semibold rounded-xl transition-all ${
              activeMenu === 'DASHBOARD' ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100/50' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <span className="text-lg mr-3">📈</span> Ringkasan
          </button>
          
          {userRole === 'ADMIN' && (
            <button
              onClick={() => { setActiveMenu('STATUS_DRIVER'); setIsSidebarOpen(false); }}
              className={`w-full flex items-center px-4 py-3.5 text-sm font-semibold rounded-xl transition-all ${
                activeMenu === 'STATUS_DRIVER' ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100/50' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className="text-lg mr-3">🚨</span> Status Laporan
            </button>
          )}

          {userRole !== 'MANAGEMENT' && (
            <>
              <button
                onClick={() => { setActiveMenu('BBM'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center px-4 py-3.5 text-sm font-semibold rounded-xl transition-all ${
                  activeMenu === 'BBM' ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100/50' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className="text-lg mr-3">📊</span> Data BBM
              </button>
              <button
                onClick={() => { setActiveMenu('KILOMETER'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center px-4 py-3.5 text-sm font-semibold rounded-xl transition-all ${
                  activeMenu === 'KILOMETER' ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100/50' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className="text-lg mr-3">🛣️</span> Data Kilometer
              </button>
              <button
                onClick={() => { setActiveMenu('PENGANTARAN'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center px-4 py-3.5 text-sm font-semibold rounded-xl transition-all ${
                  activeMenu === 'PENGANTARAN' ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100/50' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className="text-lg mr-3">📦</span> Data Pengantaran
              </button>
              
              <p className="hidden md:block px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 mt-8">Konfigurasi</p>
              <button
                onClick={() => { setActiveMenu('PENGATURAN'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center px-4 py-3.5 text-sm font-semibold rounded-xl transition-all ${
                  activeMenu === 'PENGATURAN' ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100/50' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className="text-lg mr-3">⚙️</span> Pengaturan Sistem
              </button>
            </>
          )}
        </nav>
        <div className="hidden md:block p-6 border-t border-gray-100 bg-gray-50/50">
          <button 
            onClick={handleLogout} 
            className="w-full flex items-center justify-center px-4 py-3 text-sm font-bold text-red-600 bg-white border border-red-100 hover:bg-red-50 hover:border-red-200 rounded-xl transition-all shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
            </svg>
            Keluar Aplikasi
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 lg:p-10 overflow-y-auto w-full max-w-[100vw]">
        <div className="mx-auto w-full rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-white border-b border-gray-100 p-4 lg:p-8 flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold text-gray-900 tracking-tight">
                {activeMenu === 'BBM' && 'Laporan Data BBM'}
                {activeMenu === 'KILOMETER' && 'Laporan Data Kilometer'}
                {activeMenu === 'PENGANTARAN' && 'Laporan Data Pengantaran'}
                {activeMenu === 'PENGATURAN' && 'Pengaturan Sistem'}
              </h1>

            </div>
            
            {activeMenu !== 'PENGATURAN' && (
              <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100 w-full lg:w-auto">
                <div className="flex items-center gap-2 flex-1 sm:flex-none">
                  <span className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase w-12 sm:w-auto">Filter</span>
                  <select
                    value={dateRange}
                    onChange={e => setDateRange(e.target.value)}
                    className="flex-1 rounded-lg border border-gray-200 text-gray-900 font-semibold px-3 py-2 text-sm font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white min-w-[160px]"
                  >
                    <option value="today">Hari Ini</option>
                    <option value="7_days">7 Hari Terakhir</option>
                    <option value="30_days">30 Hari Terakhir</option>
                    <option value="this_month">Bulan Ini</option>
                    <option value="last_month">Bulan Lalu</option>
                    <option value="all_time">Semua Waktu</option>
                  </select>
                </div>
                {activeMenu !== 'DASHBOARD' && (
                  <>
                    <div className="w-px h-8 bg-gray-200 mx-1 hidden sm:block"></div>
                    <button
                      onClick={exportToExcel}
                      className="rounded-lg bg-green-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-green-700 transition flex items-center justify-center gap-2 shadow-sm shadow-green-600/20 disabled:opacity-50 disabled:cursor-not-allowed mt-2 sm:mt-0 w-full sm:w-auto"
                      disabled={
                        (activeMenu === 'BBM' && filteredBbm.length === 0) ||
                        (activeMenu === 'KILOMETER' && filteredKm.length === 0) ||
                        (activeMenu === 'PENGANTARAN' && filteredPengantaran.length === 0)
                      }
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Unduh Excel
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {error && (
            <div className="mx-6 mt-6 flex items-center rounded-xl bg-red-50 p-4 text-red-700 border border-red-200/60 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">{error}</span>
            </div>
          )}

          <div className="p-4 lg:p-8 w-full max-w-full overflow-hidden">
            {activeMenu === 'DASHBOARD' && (
              <div className="space-y-6">
                {/* Dashboard Summaries */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-5 text-white shadow-lg shadow-blue-500/20">
                    <p className="text-blue-100 text-sm font-medium uppercase tracking-wider mb-1">Total Omset</p>
                    <h3 className="text-3xl font-black">Rp {totalOmset.toLocaleString('id-ID')}</h3>
                  </div>
                  <div className="md:col-span-2 bg-white border border-gray-100 rounded-2xl p-5 flex items-center shadow-sm">
                    <div className="w-28 h-28 relative flex-shrink-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Sukses', value: totalSukses },
                              { name: 'Gagal', value: totalGagal }
                            ]}
                            innerRadius={35}
                            outerRadius={50}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                          >
                            <Cell key="cell-0" fill="#10B981" />
                            <Cell key="cell-1" fill="#EF4444" />
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-sm font-black text-gray-800">{(totalSukses + totalGagal) > 0 ? ((totalSukses / (totalSukses + totalGagal)) * 100).toFixed(0) : 0}%</span>
                        <span className="text-[9px] font-semibold text-gray-400 uppercase">Rate</span>
                      </div>
                    </div>
                    
                    <div className="ml-6 flex-1 grid grid-cols-2 gap-4 border-l border-gray-100 pl-6">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-sm shadow-green-500/30"></div>
                          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Sukses</span>
                        </div>
                        <span className="text-2xl font-black text-green-600">{totalSukses} <span className="text-xs font-medium text-gray-400">Outlet</span></span>
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm shadow-red-500/30"></div>
                          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Gagal</span>
                        </div>
                        <span className="text-2xl font-black text-red-600">{totalGagal} <span className="text-xs font-medium text-gray-400">Outlet</span></span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Charts */}
                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Grafik Performa Harian</h3>
                  <div className="h-72 w-full">
                    {chartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorOmset" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                          <XAxis dataKey="tanggal" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                          <YAxis width={65} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} tickFormatter={(value) => `Rp${value/1000}k`} />
                          <Tooltip 
                            formatter={(value: any, name: any) => [`Rp ${Number(value).toLocaleString('id-ID')}`, 'Omset']}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          />
                          <Area type="monotone" dataKey="omset" name="omset" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorOmset)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400 text-sm">Tidak ada data di rentang tanggal ini</div>
                    )}
                  </div>
                </div>



                {/* Driver Leaderboard */}
                <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                  <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="text-lg font-bold text-gray-900">Klasemen Performa Driver</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-white text-gray-500 border-b border-gray-100 uppercase text-[9px] sm:text-[10px] font-bold tracking-wider">
                        <tr>
                          <th className="px-2 py-2 sm:px-5 sm:py-3 text-center">No</th>
                          <th className="px-2 py-2 sm:px-5 sm:py-3">Driver</th>
                          <th className="px-2 py-2 sm:px-5 sm:py-3 text-center">Trip</th>
                          <th className="px-2 py-2 sm:px-5 sm:py-3 text-center">Sukses</th>
                          <th className="px-2 py-2 sm:px-5 sm:py-3 text-center">Gagal</th>
                          <th className="px-2 py-2 sm:px-5 sm:py-3 text-right">Omset</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 text-xs sm:text-sm">
                        {leaderboard.length === 0 && (
                          <tr><td colSpan={6} className="px-2 py-8 sm:px-5 text-center text-gray-400">Belum ada data pengantaran</td></tr>
                        )}
                        {leaderboard.map((driver: any, idx: number) => (
                          <tr key={driver.namaDriver} className="hover:bg-blue-50/30 transition-colors">
                            <td className="px-2 py-2 sm:px-5 sm:py-3 text-center">
                              {idx === 0 ? <span className="text-base sm:text-xl" title="Juara 1">🥇</span> : idx === 1 ? <span className="text-base sm:text-xl" title="Juara 2">🥈</span> : idx === 2 ? <span className="text-base sm:text-xl" title="Juara 3">🥉</span> : <span className="text-gray-400 font-bold">{idx + 1}</span>}
                            </td>
                            <td className="px-2 py-2 sm:px-5 sm:py-3 font-bold text-gray-900">{driver.namaDriver}</td>
                            <td className="px-2 py-2 sm:px-5 sm:py-3 text-center font-medium text-gray-600">{driver.totalTrip}</td>
                            <td className="px-2 py-2 sm:px-5 sm:py-3 text-center font-bold text-green-600">{driver.sukses}</td>
                            <td className="px-2 py-2 sm:px-5 sm:py-3 text-center font-bold text-red-500">{driver.gagal}</td>
                            <td className="px-2 py-2 sm:px-5 sm:py-3 text-right font-bold text-blue-600 whitespace-nowrap">Rp {driver.omset.toLocaleString('id-ID')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeMenu === 'BBM' || activeMenu === 'KILOMETER' ? (
              <div className="overflow-x-auto w-full rounded-xl border border-gray-200 shadow-sm relative">
                <table className="w-full text-left text-sm text-gray-600 border-collapse min-w-max">
                  <thead className="bg-gray-50/80 text-gray-700 border-b border-gray-200 uppercase text-[11px] font-bold tracking-wider">
                    <tr>
                      {activeMenu === 'BBM' && (
                        <>
                          <th className="px-2 py-2 whitespace-nowrap">ID Unit</th>
                          <th className="px-2 py-2 whitespace-nowrap">Tanggal BBM</th>
                          <th className="px-2 py-2 whitespace-nowrap">Waktu</th>
                          <th className="px-2 py-2 whitespace-nowrap">SPBU</th>
                          <th className="px-2 py-2 whitespace-nowrap">Kota/Kab</th>
                          <th className="px-2 py-2 whitespace-nowrap">Jenis</th>
                          <th className="px-2 py-2 whitespace-nowrap text-right">Volume</th>
                          <th className="px-2 py-2 whitespace-nowrap text-right">Total Bayar</th>
                          <th className="px-2 py-2 whitespace-nowrap text-center">Aksi</th>
                        </>
                      )}
                      {activeMenu === 'KILOMETER' && (
                        <>
                          <th className="px-2 py-2 whitespace-nowrap">ID Unit</th>
                          <th className="px-2 py-2 whitespace-nowrap">Tanggal</th>
                          <th className="px-2 py-2 whitespace-nowrap text-right">KM Awal</th>
                          <th className="px-2 py-2 whitespace-nowrap text-right">KM Akhir</th>
                          <th className="px-2 py-2 whitespace-nowrap text-right">Total KM</th>
                          <th className="px-2 py-2 whitespace-nowrap text-center">Aksi</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {activeMenu === 'BBM' && filteredBbm.length === 0 && (
                      <tr><td colSpan={9} className="px-5 py-12 text-center text-gray-500 font-medium">Belum ada data BBM</td></tr>
                    )}
                    {activeMenu === 'BBM' && filteredBbm.map((report) => (
                      <tr key={report.id} className="hover:bg-blue-50/50 transition-colors group">
                        <td className="px-2 py-2 text-xs font-medium text-gray-900 whitespace-nowrap">{report.id_unit}</td>
                        <td className="px-2 py-2 text-xs whitespace-nowrap">{new Date(report.tanggal_bbm).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'})}</td>
                        <td className="px-2 py-2 text-xs whitespace-nowrap">{report.waktu}</td>
                        <td className="px-2 py-2 text-xs text-gray-500 whitespace-nowrap">{report.spbu || '-'}</td>
                        <td className="px-2 py-2 text-xs whitespace-nowrap">{report.kota_kab}</td>
                        <td className="px-2 py-2 text-xs whitespace-nowrap"><span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-800">{report.jenis}</span></td>
                        <td className="px-2 py-2 text-xs text-right font-medium whitespace-nowrap">{report.liter} L</td>
                        <td className="px-2 py-2 text-xs text-right font-semibold text-gray-900 whitespace-nowrap">Rp {report.total_bayar.toLocaleString('id-ID')}</td>
                        <td className="px-2 py-2 text-center whitespace-nowrap">
                          <button onClick={() => handleDeleteBbm(report.id)} className="text-red-500 hover:text-red-700 text-[10px] font-semibold md:opacity-0 md:group-hover:opacity-100 transition-opacity bg-red-50 hover:bg-red-100 px-2 py-1 rounded">Hapus</button>
                        </td>
                      </tr>
                    ))}
                    {activeMenu === 'KILOMETER' && filteredKm.length === 0 && (
                      <tr><td colSpan={6} className="px-5 py-12 text-center text-gray-500 font-medium">Belum ada data Kilometer</td></tr>
                    )}
                    {activeMenu === 'KILOMETER' && filteredKm.map((report) => (
                      <tr key={report.id} className="hover:bg-blue-50/50 transition-colors group">
                        <td className="px-2 py-2 text-xs font-medium text-gray-900 whitespace-nowrap">{report.idUnit}</td>
                        <td className="px-2 py-2 text-xs whitespace-nowrap">{new Date(report.tanggal).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'})}</td>
                        <td className="px-2 py-2 text-xs text-right text-gray-500 whitespace-nowrap">{report.kmAwal.toLocaleString('id-ID')}</td>
                        <td className="px-2 py-2 text-xs text-right text-gray-500 whitespace-nowrap">{report.kmAkhir.toLocaleString('id-ID')}</td>
                        <td className="px-2 py-2 text-xs text-right font-bold text-blue-600 whitespace-nowrap">{report.totalKm.toLocaleString('id-ID')}</td>
                        <td className="px-2 py-2 text-center whitespace-nowrap">
                          <button onClick={() => handleDeleteKm(report.id)} className="text-red-500 hover:text-red-700 text-[10px] font-semibold md:opacity-0 md:group-hover:opacity-100 transition-opacity bg-red-50 hover:bg-red-100 px-2 py-1 rounded">Hapus</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : activeMenu === 'PENGANTARAN' ? (
              <div className="overflow-x-auto w-full rounded-xl border border-gray-200 shadow-sm relative">
                <table className="w-full text-left text-sm text-gray-600 border-collapse min-w-max">
                  <thead className="bg-gray-50/80 uppercase text-[11px] font-bold tracking-wider text-gray-700 border-b border-gray-200">
                    <tr>
                      <th className="px-2 py-2 text-left border-r border-gray-200/50 whitespace-nowrap">ID Unit</th>
                      <th className="px-2 py-2 text-left border-r border-gray-200/50 whitespace-nowrap">Tanggal</th>
                      <th className="px-2 py-2 text-left border-r border-gray-200/50 whitespace-nowrap">Nama Driver</th>
                      <th className="px-2 py-2 text-left border-r border-gray-200/50 whitespace-nowrap">Trip</th>
                      <th className="px-2 py-2 text-center border-r border-gray-200/50 whitespace-nowrap">Waktu Muat Barang</th>
                      <th className="px-2 py-2 text-center border-r border-gray-200/50 whitespace-nowrap">Waktu Antar</th>
                      <th className="px-2 py-2 text-center border-r border-gray-200/50 bg-blue-50/50 text-blue-800 whitespace-nowrap">Total Antar</th>
                      <th className="px-2 py-2 text-center border-r border-gray-200/50 bg-green-50/50 text-green-800 whitespace-nowrap">Sukses</th>
                      <th className="px-2 py-2 text-center border-r border-gray-200/50 bg-red-50/50 text-red-800 whitespace-nowrap">Gagal</th>
                      <th className="px-2 py-2 text-right border-r border-gray-200/50 whitespace-nowrap">Omset</th>
                      <th className="px-2 py-2 text-left border-r border-gray-200/50">Catatan</th>
                      <th className="px-2 py-2 text-center whitespace-nowrap">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {filteredPengantaran.length === 0 && (
                      <tr><td colSpan={12} className="px-5 py-12 text-center text-gray-500 font-medium">Belum ada data Pengantaran</td></tr>
                    )}
                    {filteredPengantaran.map((report) => (
                      <tr key={report.id} className="hover:bg-blue-50/50 transition-colors group">
                        <td className="px-2 py-2 text-xs font-medium text-gray-900 border-r border-gray-100 whitespace-nowrap">{report.idUnit}</td>
                        <td className="px-2 py-2 text-xs text-gray-600 border-r border-gray-100 whitespace-nowrap">{new Date(report.tanggal).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'})}</td>
                        <td className="px-2 py-2 text-xs text-gray-600 border-r border-gray-100 whitespace-nowrap">{report.namaDriver}</td>
                        <td className="px-2 py-2 text-xs text-gray-600 border-r border-gray-100 whitespace-nowrap">{report.trip}</td>
                        <td className="px-2 py-2 text-xs text-center text-gray-500 border-r border-gray-100 whitespace-nowrap">{report.startLoading} - {report.endLoading}</td>
                        <td className="px-2 py-2 text-xs text-center text-gray-500 border-r border-gray-100 whitespace-nowrap">{report.startPengantaran || '-'} - {report.finishPengantaran || '-'}</td>
                        <td className="px-2 py-2 text-xs text-center font-black text-blue-600 border-r border-gray-100 bg-blue-50/10 whitespace-nowrap">{report.totalPengantaran}</td>
                        <td className="px-2 py-2 text-xs text-center text-green-600 font-bold border-r border-gray-100 bg-green-50/10 whitespace-nowrap">{report.suksesKirim}</td>
                        <td className="px-2 py-2 text-xs text-center text-red-600 font-bold border-r border-gray-100 bg-red-50/10 whitespace-nowrap">{report.gagalKirim}</td>
                        <td className="px-2 py-2 text-xs text-right font-semibold text-gray-900 border-r border-gray-100 whitespace-nowrap">Rp {report.omset.toLocaleString('id-ID')}</td>
                        <td className="px-2 py-2 text-xs text-gray-500 border-r border-gray-100 line-clamp-2" title={report.catatan || ''}>{report.catatan || '-'}</td>
                        <td className="px-2 py-2 text-center whitespace-nowrap">
                          <button onClick={() => handleDeletePengantaran(report.id)} className="text-red-500 hover:text-red-700 text-[10px] font-semibold md:opacity-0 md:group-hover:opacity-100 transition-opacity bg-red-50 hover:bg-red-100 px-2 py-1 rounded">Hapus</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}

                    {activeMenu === 'PENGATURAN' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Armada Management */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                        <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Manajemen Armada</h3>
                  </div>
                  
                  <form onSubmit={handleAddArmada} className="flex gap-3 mb-6">
                    <input
                      type="text"
                      value={newIdUnit}
                      onChange={(e) => setNewIdUnit(e.target.value)}
                      placeholder="Masukkan ID Unit baru"
                      className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-gray-50/50 transition-all"
                      required
                    />
                    <button
                      type="submit"
                      className="rounded-xl bg-blue-600 px-5 font-bold text-white hover:bg-blue-700 transition shadow-sm shadow-blue-500/30 whitespace-nowrap"
                    >
                      Tambah
                    </button>
                  </form>

                  <div className="overflow-hidden rounded-xl border border-gray-200">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-5 py-3 font-semibold text-gray-700">ID Unit</th>
                          <th className="px-5 py-3 font-semibold text-gray-700 w-24 text-center">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {armadaList.length === 0 && (
                          <tr><td colSpan={2} className="px-5 py-6 text-center text-gray-500 italic">Belum ada armada</td></tr>
                        )}
                        {armadaList.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-5 py-3 font-medium text-gray-800">{item.idUnit}</td>
                            <td className="px-5 py-3 text-center">
                              <button
                                onClick={() => handleDeleteArmada(item.id)}
                                className="text-red-500 hover:text-red-700 font-medium px-2 py-1 rounded bg-red-50 hover:bg-red-100 transition-colors"
                              >
                                Hapus
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Users Management */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Manajemen Driver</h3>
                  </div>

                  <form onSubmit={handleAddDriver} className="space-y-3 mb-6 p-4 rounded-xl border border-indigo-50 bg-indigo-50/30">
                    <input
                      type="text"
                      value={newDriverName}
                      onChange={(e) => setNewDriverName(e.target.value)}
                      placeholder="Username / Nama Driver"
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 bg-white transition-all"
                      required
                    />
                    <input
                      type="password"
                      value={newDriverPassword}
                      onChange={(e) => setNewDriverPassword(e.target.value)}
                      placeholder="Password"
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 bg-white transition-all"
                      required
                    />
                    <button
                      type="submit"
                      className="w-full rounded-xl bg-indigo-600 py-2.5 font-bold text-white hover:bg-indigo-700 transition shadow-sm shadow-indigo-500/30 mt-1"
                    >
                      Tambah Driver
                    </button>
                  </form>

                  <div className="overflow-hidden rounded-xl border border-gray-200">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-5 py-3 font-semibold text-gray-700">Username</th>
                          <th className="px-5 py-3 font-semibold text-gray-700 w-24 text-center">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {driverList.length === 0 && (
                          <tr><td colSpan={2} className="px-5 py-6 text-center text-gray-500 italic">Belum ada user driver</td></tr>
                        )}
                        {driverList.map((user) => (
                          <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-5 py-3 font-medium text-gray-800">{user.username}</td>
                            <td className="px-5 py-3 text-center">
                              <button
                                onClick={() => handleDeleteDriver(user.id)}
                                className="text-red-500 hover:text-red-700 font-medium px-2 py-1 rounded bg-red-50 hover:bg-red-100 transition-colors"
                              >
                                Hapus
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
            {activeMenu === 'STATUS_DRIVER' && userRole === 'ADMIN' && (
              <div className="max-w-4xl mx-auto space-y-6">
                <div className="bg-red-50 border border-red-100 rounded-2xl overflow-hidden shadow-sm">
                  <div className="p-4 sm:p-5 border-b border-red-100 bg-red-100/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex flex-col">
                      <h3 className="text-sm sm:text-lg font-bold text-red-900">🚨 Driver Belum Laporan Pengantaran</h3>
                      <span className="text-xs text-red-700 mt-1 font-medium">Cek status berdasarkan tanggal</span>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <input 
                        type="date"
                        value={statusDriverDate}
                        onChange={(e) => setStatusDriverDate(e.target.value)}
                        className="flex-1 sm:flex-none rounded-lg border border-red-200 text-red-900 font-semibold px-3 py-1.5 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 bg-white"
                      />
                      <span className="bg-red-200 text-red-800 text-xs font-bold px-2.5 py-1.5 rounded-lg whitespace-nowrap">{unsubmittedDrivers.length} Orang</span>
                    </div>
                  </div>
                  <div className="p-4 sm:p-5">
                    {unsubmittedDrivers.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {unsubmittedDrivers.map((driver: any) => (
                          <div key={driver.username} className="flex flex-col items-center justify-center p-3 bg-white border border-red-200 rounded-xl shadow-sm text-center">
                            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mb-2">
                              <span className="text-lg">👤</span>
                            </div>
                            <span className="text-red-700 font-bold text-sm truncate w-full">{driver.username}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-10">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <h4 className="text-lg font-bold text-green-800 mb-1">Mantap!</h4>
                        <p className="text-sm text-green-600 font-medium text-center">Semua driver sudah mengirimkan laporan pengantaran pada tanggal ini.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
