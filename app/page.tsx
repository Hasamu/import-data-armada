'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DriverPage() {
  const [activeTab, setActiveTab] = useState<'BBM' | 'KILOMETER' | 'PENGANTARAN'>('BBM')
  
  // States for BBM Form
  const [idUnit, setIdUnit] = useState('')
  const [tanggalBbm, setTanggalBbm] = useState('')
  const [waktu, setWaktu] = useState('')
  const [spbu, setSpbu] = useState('')
  const [kotaKabupaten, setKotaKabupaten] = useState('')
  const [jenis, setJenis] = useState('Bio Solar')
  const [volume, setVolume] = useState('')
  const [totalBayar, setTotalBayar] = useState('')

  // States for Kilometer Form
  const [kmIdUnit, setKmIdUnit] = useState('')
  const [kmTanggal, setKmTanggal] = useState('')
  const [kmAwal, setKmAwal] = useState('')
  const [kmAkhir, setKmAkhir] = useState('')

  // State untuk form Data Pengantaran
  const [pengIdUnit, setPengIdUnit] = useState('')
  const [pengTanggal, setPengTanggal] = useState('')
  const [pengTrip, setPengTrip] = useState('')
  const [pengStartLoading, setPengStartLoading] = useState('')
  const [pengEndLoading, setPengEndLoading] = useState('')
  const [pengSuksesKirim, setPengSuksesKirim] = useState('')
  const [pengGagalKirim, setPengGagalKirim] = useState('')
  const [pengOmset, setPengOmset] = useState('')
  const [pengCatatan, setPengCatatan] = useState('')
  
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [armadaList, setArmadaList] = useState<{idUnit: string}[]>([])

  useEffect(() => {
    fetch('/api/armada')
      .then(res => res.json())
      .then(data => {
        // data is an array of armada directly
        if (Array.isArray(data)) {
          setArmadaList(data)
          if (data.length > 0) {
            const firstId = data[0].idUnit
            setIdUnit(firstId)
            setKmIdUnit(firstId)
            setPengIdUnit(firstId)
          }
        }
      })
      .catch((err) => console.error("Gagal mengambil data armada:", err))
  }, [])
  
  const formatRibuan = (value: string) => {
    const numeric = value.replace(/\D/g, '')
    return numeric.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  }

  const router = useRouter()

  const handleBbmSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')

    try {
      const res = await fetch('/api/bbm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idUnit,
          tanggalBbm,
          waktu,
          spbu,
          kotaKabupaten,
          jenis,
          volume,
          totalBayar: totalBayar.replace(/\./g, '')
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setMessage('Laporan BBM berhasil dikirim!')
        setIdUnit('')
        setTanggalBbm('')
        setWaktu('')
        setSpbu('')
        setKotaKabupaten('')
        setJenis('Bio Solar')
        setVolume('')
        setTotalBayar('')
      } else {
        setError(data.error || 'Gagal mengirim laporan')
        if (res.status === 401) router.push('/login')
      }
    } catch (err) {
      setError('Terjadi kesalahan jaringan')
    } finally {
      setLoading(false)
    }
  }

  const handleKiloSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')

    try {
      const res = await fetch('/api/kilometer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idUnit: kmIdUnit,
          tanggal: kmTanggal,
          kmAwal: kmAwal,
          kmAkhir: kmAkhir
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setMessage('Laporan Kilometer berhasil dikirim!')
        setKmIdUnit('')
        setKmTanggal('')
        setKmAwal('')
        setKmAkhir('')
      } else {
        setError(data.error || 'Gagal mengirim laporan')
        if (res.status === 401) router.push('/login')
      }
    } catch (err) {
      setError('Terjadi kesalahan jaringan')
    } finally {
      setLoading(false)
    }
  }

  const submitPengantaran = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')
    try {
      const res = await fetch('/api/pengantaran', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idUnit: pengIdUnit,
          tanggal: pengTanggal,
          trip: pengTrip,
          startLoading: pengStartLoading,
          endLoading: pengEndLoading,
          suksesKirim: pengSuksesKirim,
          gagalKirim: pengGagalKirim,
          omset: pengOmset.replace(/\./g, ''),
          catatan: pengCatatan
        }),
      })
      if (res.ok) {
        setMessage('Laporan pengantaran berhasil dikirim!')
        setPengIdUnit('')
        setPengTanggal('')
        setPengTrip('')
        setPengStartLoading('')
        setPengEndLoading('')
        setPengSuksesKirim('')
        setPengGagalKirim('')
        setPengOmset('')
        setPengCatatan('')
      } else {
        setError('Gagal mengirim laporan')
      }
    } catch {
      setError('Terjadi kesalahan jaringan')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-8">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white shadow-xl shadow-blue-900/5 mt-2 overflow-hidden border border-white/60 backdrop-blur-sm">
        
        {/* Header & Tabs */}
        <div className="bg-white/80 border-b border-gray-100">
          <div className="flex justify-between items-center p-6 sm:p-8 pb-6">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="3" width="15" height="13" rx="2" ry="2"></rect>
                  <path d="M16 8h4l3 3v5h-7V8z"></path>
                  <circle cx="5.5" cy="18.5" r="2.5"></circle>
                  <circle cx="18.5" cy="18.5" r="2.5"></circle>
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">ArmadaKita</h1>
                <p className="text-sm font-bold text-gray-500 mt-0.5">Laporan Harian Driver</p>
              </div>
            </div>
            <button 
              onClick={handleLogout} 
              className="flex items-center justify-center p-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 hover:scale-105 transition-all shadow-sm"
              title="Logout"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          <div className="px-6 sm:px-8 pb-6">
            <div className="flex p-1.5 space-x-1 bg-gray-100/80 rounded-2xl overflow-x-auto hide-scrollbar border border-gray-200/50">
              <button 
                onClick={() => { setActiveTab('BBM'); setMessage(''); setError(''); }}
                className={`flex-1 py-3 px-4 text-sm font-bold rounded-xl transition-all whitespace-nowrap flex items-center justify-center ${activeTab === 'BBM' ? 'bg-white text-blue-700 shadow-sm border border-gray-200/50' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <span className="mr-2 text-lg">⛽</span> BBM
              </button>
              <button 
                onClick={() => { setActiveTab('KILOMETER'); setMessage(''); setError(''); }}
                className={`flex-1 py-3 px-4 text-sm font-bold rounded-xl transition-all whitespace-nowrap flex items-center justify-center ${activeTab === 'KILOMETER' ? 'bg-white text-blue-700 shadow-sm border border-gray-200/50' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <span className="mr-2 text-lg">🛣️</span> Kilometer
              </button>
              <button 
                onClick={() => { setActiveTab('PENGANTARAN'); setMessage(''); setError(''); }}
                className={`flex-1 py-3 px-4 text-sm font-bold rounded-xl transition-all whitespace-nowrap flex items-center justify-center ${activeTab === 'PENGANTARAN' ? 'bg-white text-blue-700 shadow-sm border border-gray-200/50' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <span className="mr-2 text-lg">📦</span> Pengantaran
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          {message && (
            <div className="mb-6 flex items-center rounded-xl bg-green-50 p-4 text-green-700 border border-green-200/60 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">{message}</span>
            </div>
          )}
          {error && (
            <div className="mb-6 flex items-center rounded-xl bg-red-50 p-4 text-red-700 border border-red-200/60 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Form Data BBM */}
          {activeTab === 'BBM' && (
            <form onSubmit={handleBbmSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">ID Unit</label>
                  <select
                    className="w-full rounded-xl text-gray-900 font-semibold border border-gray-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-gray-50/50 transition-all"
                    value={idUnit}
                    onChange={(e) => setIdUnit(e.target.value)}
                    required
                  >
                    <option value="" disabled>Pilih ID Unit</option>
                    {armadaList.map((armada, i) => (
                      <option key={i} value={armada.idUnit}>{armada.idUnit}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">Tanggal BBM</label>
                  <input
                    type="date"
                    className="w-full rounded-xl text-gray-900 font-semibold border border-gray-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-gray-50/50 transition-all"
                    value={tanggalBbm}
                    onChange={(e) => setTanggalBbm(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">Waktu</label>
                  <input
                    type="time"
                    className="w-full rounded-xl text-gray-900 font-semibold border border-gray-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-gray-50/50 transition-all"
                    value={waktu}
                    onChange={(e) => setWaktu(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">SPBU (Opsional)</label>
                  <input
                    type="text"
                    className="w-full rounded-xl text-gray-900 font-semibold border border-gray-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-gray-50/50 transition-all"
                    value={spbu}
                    onChange={(e) => setSpbu(e.target.value)}
                    placeholder="Nama atau Kode SPBU"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">Kota/Kabupaten</label>
                  <input
                    type="text"
                    className="w-full rounded-xl text-gray-900 font-semibold border border-gray-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-gray-50/50 transition-all"
                    value={kotaKabupaten}
                    onChange={(e) => setKotaKabupaten(e.target.value)}
                    placeholder="Contoh: Jakarta Selatan"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">Jenis BBM</label>
                  <select
                    className="w-full rounded-xl text-gray-900 font-semibold border border-gray-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white transition-all"
                    value={jenis}
                    onChange={(e) => setJenis(e.target.value)}
                    required
                  >
                    <option value="Bio Solar">Bio Solar</option>
                    <option value="Dexlite">Dexlite</option>
                    <option value="Pertamina Dex">Pertamina Dex</option>
                    <option value="Pertalite">Pertalite</option>
                    <option value="Pertamax">Pertamax</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">Volume (Liter)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full rounded-xl text-gray-900 font-semibold border border-gray-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-gray-50/50 transition-all"
                    value={volume}
                    onChange={(e) => setVolume(e.target.value)}
                    placeholder="0.0"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">Total Bayar (Rp)</label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                      <span className="text-gray-500 font-medium">Rp</span>
                    </div>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="w-full rounded-xl text-gray-900 font-semibold border border-gray-200 pl-12 pr-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-gray-50/50 transition-all"
                      value={totalBayar}
                      onChange={(e) => setTotalBayar(formatRibuan(e.target.value))}
                      placeholder="0"
                      required
                    />
                  </div>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-4 px-4 rounded-xl shadow-lg shadow-blue-500/30 text-base font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 transition-all active:scale-[0.98] mt-6"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Mengirim Data...
                  </span>
                ) : 'Kirim Data BBM'}
              </button>
            </form>
          )}

          {/* Form Data Kilometer */}
          {activeTab === 'KILOMETER' && (
            <form onSubmit={handleKiloSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">ID Unit</label>
                  <select
                    className="w-full rounded-xl text-gray-900 font-semibold border border-gray-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-gray-50/50 transition-all"
                    value={kmIdUnit}
                    onChange={(e) => setKmIdUnit(e.target.value)}
                    required
                  >
                    <option value="" disabled>Pilih ID Unit</option>
                    {armadaList.map((armada, i) => (
                      <option key={i} value={armada.idUnit}>{armada.idUnit}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">Tanggal</label>
                  <input
                    type="date"
                    className="w-full rounded-xl text-gray-900 font-semibold border border-gray-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-gray-50/50 transition-all"
                    value={kmTanggal}
                    onChange={(e) => setKmTanggal(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">KM Awal</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      className="w-full rounded-xl text-gray-900 font-semibold border border-gray-200 px-4 pr-12 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-gray-50/50 transition-all"
                      value={kmAwal}
                      onChange={(e) => setKmAwal(e.target.value)}
                      placeholder="0"
                      required
                    />
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                      <span className="text-gray-500 font-medium text-sm">KM</span>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">KM Akhir</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      className="w-full rounded-xl text-gray-900 font-semibold border border-gray-200 px-4 pr-12 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-gray-50/50 transition-all"
                      value={kmAkhir}
                      onChange={(e) => setKmAkhir(e.target.value)}
                      placeholder="0"
                      required
                    />
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                      <span className="text-gray-500 font-medium text-sm">KM</span>
                    </div>
                  </div>
                </div>
                <div className="md:col-span-2 pt-2">
                  <div className="flex items-start p-4 bg-blue-50/80 border border-blue-100 rounded-xl text-blue-800 text-sm shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <p><strong>Total KM</strong> akan dihitung secara otomatis oleh sistem saat data dikirim (KM Akhir - KM Awal).</p>
                  </div>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-4 px-4 rounded-xl shadow-lg shadow-blue-500/30 text-base font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 transition-all active:scale-[0.98] mt-6"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Mengirim Data...
                  </span>
                ) : 'Kirim Data Kilometer'}
              </button>
            </form>
          )}

          {/* Form Data PENGANTARAN */}
          {activeTab === 'PENGANTARAN' && (
            <form onSubmit={submitPengantaran} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">ID Unit</label>
                  <select 
                    required 
                    value={pengIdUnit} 
                    onChange={e => setPengIdUnit(e.target.value)} 
                    className="w-full rounded-xl text-gray-900 font-semibold border border-gray-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-gray-50/50 transition-all"
                  >
                    <option value="" disabled>Pilih ID Unit</option>
                    {armadaList.map((armada, i) => (
                      <option key={i} value={armada.idUnit}>{armada.idUnit}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">Tanggal</label>
                  <input 
                    type="date" 
                    required 
                    value={pengTanggal} 
                    onChange={e => setPengTanggal(e.target.value)} 
                    className="w-full rounded-xl text-gray-900 font-semibold border border-gray-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-gray-50/50 transition-all" 
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">Trip</label>
                  <input 
                    type="text" 
                    required 
                    value={pengTrip} 
                    onChange={e => setPengTrip(e.target.value)} 
                    placeholder="Contoh: Trip 1" 
                    className="w-full rounded-xl text-gray-900 font-semibold border border-gray-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-gray-50/50 transition-all" 
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">Start Loading</label>
                  <input 
                    type="time" 
                    required 
                    value={pengStartLoading} 
                    onChange={e => setPengStartLoading(e.target.value)} 
                    className="w-full rounded-xl text-gray-900 font-semibold border border-gray-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-gray-50/50 transition-all" 
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">End Loading</label>
                  <input 
                    type="time" 
                    required 
                    value={pengEndLoading} 
                    onChange={e => setPengEndLoading(e.target.value)} 
                    className="w-full rounded-xl text-gray-900 font-semibold border border-gray-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-gray-50/50 transition-all" 
                  />
                </div>
              </div>
              
              <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100/50 grid grid-cols-2 gap-5 mt-2">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">Sukses Kirim</label>
                  <input 
                    type="number" 
                    required 
                    value={pengSuksesKirim} 
                    onChange={e => setPengSuksesKirim(e.target.value)} 
                    placeholder="0" 
                    className="w-full rounded-xl text-gray-900 font-semibold border border-gray-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white transition-all" 
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">Gagal Kirim</label>
                  <input 
                    type="number" 
                    required 
                    value={pengGagalKirim} 
                    onChange={e => setPengGagalKirim(e.target.value)} 
                    placeholder="0" 
                    className="w-full rounded-xl text-gray-900 font-semibold border border-gray-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white transition-all" 
                  />
                </div>
                <div className="col-span-2 pt-4 border-t border-blue-200/50 flex justify-between items-center">
                  <span className="block text-sm font-medium text-gray-600">Total Pengantaran (Otomatis)</span>
                  <div className="text-2xl font-black text-blue-600">
                    {(parseInt(pengSuksesKirim || '0') + parseInt(pengGagalKirim || '0')) || 0}
                  </div>
                </div>
              </div>
              
              <div className="mt-2">
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">Omset (Rp)</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <span className="text-gray-500 font-medium">Rp</span>
                  </div>
                  <input 
                    type="text"
                    inputMode="numeric"
                    required 
                    value={pengOmset} 
                    onChange={e => setPengOmset(formatRibuan(e.target.value))} 
                    className="w-full rounded-xl text-gray-900 font-semibold border border-gray-200 pl-12 pr-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-gray-50/50 transition-all" 
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="mt-2">
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">Catatan Gagal Kirim (Opsional)</label>
                <textarea 
                  value={pengCatatan} 
                  onChange={e => setPengCatatan(e.target.value)} 
                  className="w-full rounded-xl text-gray-900 font-semibold border border-gray-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-gray-50/50 transition-all min-h-[80px]" 
                  placeholder="Isi alasan jika ada gagal kirim..."
                />
              </div>
              
              <button 
                type="submit" 
                disabled={loading} 
                className="w-full flex justify-center items-center py-4 px-4 rounded-xl shadow-lg shadow-blue-500/30 text-base font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 transition-all active:scale-[0.98] mt-4"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Mengirim Data...
                  </span>
                ) : 'Kirim Data Pengantaran'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
