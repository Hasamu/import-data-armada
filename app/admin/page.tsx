'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import * as XLSX from 'xlsx'

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
  const [activeMenu, setActiveMenu] = useState<'BBM' | 'KILOMETER' | 'PENGANTARAN' | 'PENGATURAN'>('BBM')
  const [newIdUnit, setNewIdUnit] = useState('')
  const [newDriverName, setNewDriverName] = useState('')
  const [newDriverPassword, setNewDriverPassword] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
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
    fetchData()
  }, [])

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
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans">
      {/* Sidebar Navigation */}
      <div className="w-full md:w-72 md:min-h-screen bg-white shadow-xl shadow-gray-200/50 flex flex-col z-10 border-b md:border-b-0 md:border-r border-gray-100 md:sticky md:top-0">
        <div className="p-6 md:p-8 border-b border-gray-100 flex items-center justify-between">
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
          <button onClick={handleLogout} className="md:hidden p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
        <nav className="p-4 md:flex-1 md:p-5 flex flex-row overflow-x-auto gap-2 md:flex-col md:space-y-2 whitespace-nowrap scrollbar-hide">
          <p className="hidden md:block px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 mt-2">Menu Laporan</p>
          <button
            onClick={() => setActiveMenu('BBM')}
            className={`w-full flex items-center px-4 py-3.5 text-sm font-semibold rounded-xl transition-all ${
              activeMenu === 'BBM' ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100/50' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <span className="text-lg mr-3">📊</span> Data BBM
          </button>
          <button
            onClick={() => setActiveMenu('KILOMETER')}
            className={`w-full flex items-center px-4 py-3.5 text-sm font-semibold rounded-xl transition-all ${
              activeMenu === 'KILOMETER' ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100/50' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <span className="text-lg mr-3">🛣️</span> Data Kilometer
          </button>
          <button
            onClick={() => setActiveMenu('PENGANTARAN')}
            className={`w-full flex items-center px-4 py-3.5 text-sm font-semibold rounded-xl transition-all ${
              activeMenu === 'PENGANTARAN' ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100/50' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <span className="text-lg mr-3">📦</span> Data Pengantaran
          </button>
          
          <p className="hidden md:block px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 mt-8">Konfigurasi</p>
          <button
            onClick={() => setActiveMenu('PENGATURAN')}
            className={`w-full flex items-center px-4 py-3.5 text-sm font-semibold rounded-xl transition-all ${
              activeMenu === 'PENGATURAN' ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100/50' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <span className="text-lg mr-3">⚙️</span> Pengaturan Sistem
          </button>
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
      <div className="flex-1 p-6 lg:p-10 overflow-y-auto">
        <div className="mx-auto max-w-6xl rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-white border-b border-gray-100 p-6 lg:p-8 flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                {activeMenu === 'BBM' && 'Laporan Data BBM'}
                {activeMenu === 'KILOMETER' && 'Laporan Data Kilometer'}
                {activeMenu === 'PENGANTARAN' && 'Laporan Data Pengantaran'}
                {activeMenu === 'PENGATURAN' && 'Pengaturan Sistem'}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {activeMenu === 'PENGATURAN' ? 'Kelola master data armada dan pengguna sistem.' : 'Kelola dan unduh data laporan operasional.'}
              </p>
            </div>
            
            {activeMenu !== 'PENGATURAN' && (
              <div className="flex flex-wrap items-center gap-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-500 uppercase">Dari</span>
                  <input 
                    type="date" 
                    value={startDate} 
                    onChange={e => setStartDate(e.target.value)}
                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-500 uppercase">Sampai</span>
                  <input 
                    type="date" 
                    value={endDate} 
                    onChange={e => setEndDate(e.target.value)}
                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white"
                  />
                </div>
                {(startDate || endDate) && (
                  <button
                    onClick={() => { setStartDate(''); setEndDate(''); }}
                    className="text-sm text-red-600 hover:text-red-800 font-bold px-2 transition-colors"
                  >
                    Reset
                  </button>
                )}
                <div className="w-px h-8 bg-gray-200 mx-1 hidden sm:block"></div>
                <button
                  onClick={exportToExcel}
                  className="rounded-lg bg-green-600 px-4 py-2 text-sm font-bold text-white hover:bg-green-700 transition flex items-center gap-2 shadow-sm shadow-green-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
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

          <div className="p-6 lg:p-8">
            {activeMenu === 'BBM' || activeMenu === 'KILOMETER' ? (
              <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
                <table className="w-full text-left text-sm text-gray-600 border-collapse">
                  <thead className="bg-gray-50/80 text-gray-700 border-b border-gray-200 uppercase text-[11px] font-bold tracking-wider">
                    <tr>
                      {activeMenu === 'BBM' && (
                        <>
                          <th className="px-5 py-4">ID Unit</th>
                          <th className="px-5 py-4">Tanggal BBM</th>
                          <th className="px-5 py-4">Waktu</th>
                          <th className="px-5 py-4">SPBU</th>
                          <th className="px-5 py-4">Kota/Kabupaten</th>
                          <th className="px-5 py-4">Jenis</th>
                          <th className="px-5 py-4 text-right">Volume (L)</th>
                          <th className="px-5 py-4 text-right">Total Bayar</th>
                          <th className="px-5 py-4 text-center">Aksi</th>
                        </>
                      )}
                      {activeMenu === 'KILOMETER' && (
                        <>
                          <th className="px-5 py-4">ID Unit</th>
                          <th className="px-5 py-4">Tanggal</th>
                          <th className="px-5 py-4 text-right">KM Awal</th>
                          <th className="px-5 py-4 text-right">KM Akhir</th>
                          <th className="px-5 py-4 text-right">Total KM</th>
                          <th className="px-5 py-4 text-center">Aksi</th>
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
                        <td className="px-5 py-4 font-medium text-gray-900">{report.id_unit}</td>
                        <td className="px-5 py-4 whitespace-nowrap">{new Date(report.tanggal_bbm).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'})}</td>
                        <td className="px-5 py-4">{report.waktu}</td>
                        <td className="px-5 py-4 text-gray-500">{report.spbu || '-'}</td>
                        <td className="px-5 py-4">{report.kota_kab}</td>
                        <td className="px-5 py-4"><span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">{report.jenis}</span></td>
                        <td className="px-5 py-4 text-right font-medium">{report.liter}</td>
                        <td className="px-5 py-4 text-right font-semibold text-gray-900">Rp {report.total_bayar.toLocaleString('id-ID')}</td>
                        <td className="px-5 py-4 text-center">
                          <button onClick={() => handleDeleteBbm(report.id)} className="text-red-500 hover:text-red-700 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg">Hapus</button>
                        </td>
                      </tr>
                    ))}
                    {activeMenu === 'KILOMETER' && filteredKm.length === 0 && (
                      <tr><td colSpan={6} className="px-5 py-12 text-center text-gray-500 font-medium">Belum ada data Kilometer</td></tr>
                    )}
                    {activeMenu === 'KILOMETER' && filteredKm.map((report) => (
                      <tr key={report.id} className="hover:bg-blue-50/50 transition-colors group">
                        <td className="px-5 py-4 font-medium text-gray-900">{report.idUnit}</td>
                        <td className="px-5 py-4 whitespace-nowrap">{new Date(report.tanggal).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'})}</td>
                        <td className="px-5 py-4 text-right text-gray-500">{report.kmAwal.toLocaleString('id-ID')}</td>
                        <td className="px-5 py-4 text-right text-gray-500">{report.kmAkhir.toLocaleString('id-ID')}</td>
                        <td className="px-5 py-4 text-right font-bold text-blue-600">{report.totalKm.toLocaleString('id-ID')}</td>
                        <td className="px-5 py-4 text-center">
                          <button onClick={() => handleDeleteKm(report.id)} className="text-red-500 hover:text-red-700 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg">Hapus</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : activeMenu === 'PENGANTARAN' ? (
              <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50/80 uppercase text-[11px] font-bold tracking-wider text-gray-700 border-b border-gray-200">
                    <tr>
                      <th className="px-5 py-4 text-left border-r border-gray-200/50">ID Unit</th>
                      <th className="px-5 py-4 text-left border-r border-gray-200/50">Tanggal</th>
                      <th className="px-5 py-4 text-left border-r border-gray-200/50">Nama Driver</th>
                      <th className="px-5 py-4 text-left border-r border-gray-200/50">Trip</th>
                      <th className="px-5 py-4 text-left border-r border-gray-200/50" colSpan={2}>Waktu (Start - End)</th>
                      <th className="px-5 py-4 text-center border-r border-gray-200/50 bg-blue-50/50 text-blue-800">Total Pengantaran</th>
                      <th className="px-5 py-4 text-center border-r border-gray-200/50 bg-green-50/50 text-green-800">Sukses</th>
                      <th className="px-5 py-4 text-center border-r border-gray-200/50 bg-red-50/50 text-red-800">Gagal</th>
                      <th className="px-5 py-4 text-right border-r border-gray-200/50">Omset</th>
                      <th className="px-5 py-4 text-left border-r border-gray-200/50">Catatan</th>
                      <th className="px-5 py-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {filteredPengantaran.length === 0 && (
                      <tr><td colSpan={12} className="px-5 py-12 text-center text-gray-500 font-medium">Belum ada data Pengantaran</td></tr>
                    )}
                    {filteredPengantaran.map((report) => (
                      <tr key={report.id} className="hover:bg-blue-50/50 transition-colors group">
                        <td className="px-5 py-3 whitespace-nowrap font-medium text-gray-900 border-r border-gray-100">{report.idUnit}</td>
                        <td className="px-5 py-3 whitespace-nowrap text-sm border-r border-gray-100">{new Date(report.tanggal).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'})}</td>
                        <td className="px-5 py-3 text-sm text-gray-600 border-r border-gray-100">{report.namaDriver}</td>
                        <td className="px-5 py-3 text-sm border-r border-gray-100">{report.trip}</td>
                        <td className="px-3 py-3 text-sm text-right text-gray-500">{report.startLoading}</td>
                        <td className="px-3 py-3 text-sm border-r border-gray-100 text-gray-500">- {report.endLoading}</td>
                        <td className="px-5 py-3 text-center text-sm font-black text-blue-600 border-r border-gray-100 bg-blue-50/10">{report.totalPengantaran}</td>
                        <td className="px-5 py-3 text-center text-sm text-green-600 font-bold border-r border-gray-100 bg-green-50/10">{report.suksesKirim}</td>
                        <td className="px-5 py-3 text-center text-sm text-red-600 font-bold border-r border-gray-100 bg-red-50/10">{report.gagalKirim}</td>
                        <td className="px-5 py-3 text-right text-sm font-semibold text-gray-900 border-r border-gray-100">Rp {report.omset.toLocaleString('id-ID')}</td>
                        <td className="px-5 py-3 text-sm text-gray-500 border-r border-gray-100 truncate max-w-xs" title={report.catatan || ''}>{report.catatan || '-'}</td>
                        <td className="px-5 py-3 text-center">
                          <button onClick={() => handleDeletePengantaran(report.id)} className="text-red-500 hover:text-red-700 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg">Hapus</button>
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
          </div>
        </div>
      </div>
    </div>
  )
}
