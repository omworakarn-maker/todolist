'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../../lib/supabase'
import { useAnimatedAlert } from '../../../components/AnimatedAlert'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
export default function Dashboard() {
  const [countWait, setCountWait] = useState(0)
  const [countDoing, setCountDoing] = useState(0)
  const [countSuccess, setCountSuccess] = useState(0)
  const [loading, setLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState('')
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  
  const router = useRouter()
  const { showAlert } = useAnimatedAlert()

  useEffect(() => {
    fetchData()
    const timer = setInterval(() => {
      const now = new Date()
      setCurrentTime(now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError

      if (!user) return

      // Fetch all counts in parallel or fetch all todos and group them
      // Since it's a small app, fetching all counts is fine, or fetching all todos is fine
      // Let's use count queries
      const getCount = async (status: string) => {
        const { count, error } = await supabase
          .from('Todo')
          .select('*', { count: 'exact', head: true })
          .eq('member_id', user.id)
          .eq('status', status)
        
        if (error) throw error
        return count || 0
      }

      const [waitCount, doingCount, successCount] = await Promise.all([
        getCount('use'),
        getCount('doing'),
        getCount('success')
      ])

      setCountWait(waitCount)
      setCountDoing(doingCount)
      setCountSuccess(successCount)
    } catch (err: any) {
      showAlert({
        title: 'เกิดข้อผิดพลาด',
        text: err.message,
        icon: 'error',
        confirmButtonColor: '#4f46e5'
      })
    } finally {
      setLoading(false)
    }
  }

  const totalTasks = countWait + countDoing + countSuccess
  const successPercentage = totalTasks > 0 ? Math.round((countSuccess / totalTasks) * 100) : 0
  const doingPercentage = totalTasks > 0 ? Math.round((countDoing / totalTasks) * 100) : 0
  const waitPercentage = totalTasks > 0 ? Math.round((countWait / totalTasks) * 100) : 0

  // SVG Radial Gauge calculations
  const radius = 42
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (successPercentage / 100) * circumference

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] text-slate-800 p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Minimal Bright Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200/70">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              Dashboard สรุปภาพรวมงาน
            </h1>
            <p className="text-slate-500 text-sm mt-1">ติดตามสถานะและความคืบหน้าของงานทั้งหมดในระบบ</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-sm font-semibold px-5 py-3 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer disabled:opacity-50"
              title="กดเพื่ออัปเดตข้อมูลล่าสุด"
            >
              <svg className={`w-4 h-4 ${loading ? 'animate-spin' : 'hover:rotate-180 transition-transform duration-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>{loading ? 'กำลังดึงข้อมูล...' : 'รีเฟรชข้อมูล'}</span>
            </button>
          </div>
        </div>

        {/* Top Minimal Banner & 3 Interactive Clickable Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          
          {/* Main Total Banner (Clickable Minimal) */}
          <Link
            href="/backoffice/home/todo"
            className="lg:col-span-1 bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm hover:shadow-lg hover:-translate-y-2 hover:-rotate-2 hover:border-slate-400 active:scale-95 transition-all duration-300 flex flex-col justify-between relative overflow-hidden group cursor-pointer"
            title="คลิกเพื่อไปหน้าจัดการรายการงานทั้งหมด"
          >
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold text-slate-700 bg-slate-100 group-hover:bg-slate-900 group-hover:text-white px-3 py-1 rounded-xl border border-slate-200/60 transition-colors">
                  📋 งานทั้งหมดในระบบ
                </span>
                <span className="text-xs text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity font-semibold">
                  ดูทั้งหมด ➔
                </span>
              </div>
              <div className="text-4xl font-extrabold text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors">
                {totalTasks} <span className="text-sm font-normal text-slate-500">รายการ</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">อัตราความสำเร็จ</span>
              <span className="text-slate-800 font-bold text-xs bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200/50">
                {successPercentage}%
              </span>
            </div>
          </Link>

          {/* 3 Clickable Fresh Metric Cards */}
          <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-6">
            
            {/* 1. Wait Card (Clickable) */}
            <Link
              href="/backoffice/home/todo"
              className="bg-white border border-amber-200/70 p-6 rounded-3xl shadow-sm hover:shadow-lg hover:-translate-y-2 hover:-rotate-2 hover:border-amber-400 active:scale-95 transition-all duration-300 relative overflow-hidden group cursor-pointer"
              title="คลิกเพื่อดูรายการงานที่รอทำ"
            >
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold text-amber-700 bg-amber-50 group-hover:bg-amber-500 group-hover:text-white px-3 py-1 rounded-xl border border-amber-200/50 transition-colors">
                  ⏳ รอทำ
                </span>
                <div className="p-3 rounded-2xl bg-amber-50 text-amber-600 group-hover:bg-amber-500 group-hover:text-white group-hover:-rotate-12 transition-all duration-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="text-4xl font-extrabold text-slate-900 tracking-tight group-hover:text-amber-600 transition-colors">{countWait}</div>
              <div className="mt-3 text-xs text-slate-500 flex justify-between items-center">
                <span>คิดเป็น <strong className="text-amber-600">{waitPercentage}%</strong></span>
                <span className="text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity font-semibold">เปิดงาน ➔</span>
              </div>
            </Link>

            {/* 2. Doing Card (Clickable) */}
            <Link
              href="/backoffice/home/todo"
              className="bg-white border border-sky-200/70 p-6 rounded-3xl shadow-sm hover:shadow-lg hover:-translate-y-2 hover:-rotate-2 hover:border-sky-400 active:scale-95 transition-all duration-300 relative overflow-hidden group cursor-pointer"
              title="คลิกเพื่อดูรายการงานที่กำลังทำ"
            >
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold text-sky-700 bg-sky-50 group-hover:bg-sky-500 group-hover:text-white px-3 py-1 rounded-xl border border-sky-200/50 transition-colors">
                  ⚡ กำลังทำ
                </span>
                <div className="p-3 rounded-2xl bg-sky-50 text-sky-600 group-hover:bg-sky-500 group-hover:text-white group-hover:-rotate-12 transition-all duration-300">
                  <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              <div className="text-4xl font-extrabold text-slate-900 tracking-tight group-hover:text-sky-600 transition-colors">{countDoing}</div>
              <div className="mt-3 text-xs text-slate-500 flex justify-between items-center">
                <span>คิดเป็น <strong className="text-sky-600">{doingPercentage}%</strong></span>
                <span className="text-sky-600 opacity-0 group-hover:opacity-100 transition-opacity font-semibold">เปิดงาน ➔</span>
              </div>
            </Link>

            {/* 3. Success Card (Clickable) */}
            <Link
              href="/backoffice/home/todo"
              className="bg-white border border-emerald-200/70 p-6 rounded-3xl shadow-sm hover:shadow-lg hover:-translate-y-2 hover:-rotate-2 hover:border-emerald-400 active:scale-95 transition-all duration-300 relative overflow-hidden group cursor-pointer"
              title="คลิกเพื่อดูรายการงานที่ทำเสร็จแล้ว"
            >
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 group-hover:bg-emerald-500 group-hover:text-white px-3 py-1 rounded-xl border border-emerald-200/50 transition-colors">
                  ✅ ทำเสร็จแล้ว
                </span>
                <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white group-hover:-rotate-12 transition-all duration-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="text-4xl font-extrabold text-slate-900 tracking-tight group-hover:text-emerald-600 transition-colors">{countSuccess}</div>
              <div className="mt-3 text-xs text-slate-500 flex justify-between items-center">
                <span>คิดเป็น <strong className="text-emerald-600">{successPercentage}%</strong></span>
                <span className="text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity font-semibold">เปิดงาน ➔</span>
              </div>
            </Link>

          </div>
        </div>

        {/* Lower Main Analytics & Interactive Radial Gauge Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Task Breakdown with Hover Highlights */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-7 shadow-sm border border-slate-200/70 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight">สัดส่วนสถานะงาน (Task Breakdown)</h3>
                  <p className="text-xs text-slate-400 mt-0.5">นำเมาส์ไปวางบนแถบสีเพื่อดูสัดส่วนงาน</p>
                </div>
                <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full cursor-default">
                  รวม {totalTasks} งาน
                </span>
              </div>

              {/* Progress Bar (Capsules / Oval Segments) */}
              <div className="h-5 w-full bg-slate-100 rounded-full p-1 border border-slate-200/60 mb-8 flex gap-1.5 items-center">
                {waitPercentage > 0 && (
                  <div
                    style={{ width: `${waitPercentage}%` }}
                    className="bg-amber-400 h-full rounded-full transition-all duration-300"
                    title={`รอทำ: ${countWait} งาน (${waitPercentage}%)`}
                  ></div>
                )}
                {doingPercentage > 0 && (
                  <div
                    style={{ width: `${doingPercentage}%` }}
                    className="bg-sky-400 h-full rounded-full transition-all duration-300"
                    title={`กำลังทำ: ${countDoing} งาน (${doingPercentage}%)`}
                  ></div>
                )}
                {successPercentage > 0 && (
                  <div
                    style={{ width: `${successPercentage}%` }}
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    title={`เสร็จแล้ว: ${countSuccess} งาน (${successPercentage}%)`}
                  ></div>
                )}
              </div>

              {/* Clickable Legend Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Link
                  href="/backoffice/home/todo"
                  className="p-4 rounded-2xl bg-amber-50/70 border border-amber-100 hover:border-amber-300 hover:bg-amber-100/60 hover:shadow-md hover:-translate-y-1.5 hover:-rotate-2 active:scale-95 transition-all duration-300 cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400 group-hover:scale-125 transition-transform"></span>
                      <span className="text-xs text-amber-800 font-semibold">รอทำ (Wait)</span>
                    </div>
                    <span className="text-[11px] text-amber-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">ดู ➔</span>
                  </div>
                  <div className="text-2xl font-extrabold text-slate-900 group-hover:text-amber-700 transition-colors">{countWait}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{waitPercentage}% ของทั้งหมด</div>
                </Link>

                <Link
                  href="/backoffice/home/todo"
                  className="p-4 rounded-2xl bg-sky-50/70 border border-sky-100 hover:border-sky-300 hover:bg-sky-100/60 hover:shadow-md hover:-translate-y-1.5 hover:-rotate-2 active:scale-95 transition-all duration-300 cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-sky-400 group-hover:scale-125 transition-transform"></span>
                      <span className="text-xs text-sky-800 font-semibold">กำลังทำ (Doing)</span>
                    </div>
                    <span className="text-[11px] text-sky-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">ดู ➔</span>
                  </div>
                  <div className="text-2xl font-extrabold text-slate-900 group-hover:text-sky-700 transition-colors">{countDoing}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{doingPercentage}% ของทั้งหมด</div>
                </Link>

                <Link
                  href="/backoffice/home/todo"
                  className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 hover:border-emerald-300 hover:bg-emerald-100/60 hover:shadow-md hover:-translate-y-1.5 hover:-rotate-2 active:scale-95 transition-all duration-300 cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 group-hover:scale-125 transition-transform"></span>
                      <span className="text-xs text-emerald-800 font-semibold">เสร็จแล้ว (Success)</span>
                    </div>
                    <span className="text-[11px] text-emerald-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">ดู ➔</span>
                  </div>
                  <div className="text-2xl font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">{countSuccess}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{successPercentage}% ของทั้งหมด</div>
                </Link>
              </div>
            </div>
          </div>

          {/* Interactive Radial Gauge Card */}
          <div className="bg-white rounded-3xl p-7 shadow-sm border border-slate-200/70 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="mb-4">
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">ความคืบหน้าภาพรวม</h3>
              </div>

              {/* Clean Radial Progress SVG */}
              <div className="relative my-6 flex justify-center items-center">
                <svg className="w-44 h-44 transform -rotate-90">
                  <circle
                    cx="88"
                    cy="88"
                    r={radius}
                    className="stroke-slate-100"
                    strokeWidth="10"
                    fill="transparent"
                  />
                  <circle
                    cx="88"
                    cy="88"
                    r={radius}
                    className="stroke-emerald-500 transition-all duration-700 ease-out"
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col justify-center items-center text-center">
                  <span className="text-3xl font-extrabold text-slate-900 font-mono">{successPercentage}%</span>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase">อัตราสำเร็จ</span>
                </div>
              </div>

              <p className="text-xs text-slate-500 text-center leading-relaxed px-2">
                คำนวณจากจำนวนงานที่ทำเสร็จแล้วเทียบกับงานทั้งหมดในระบบ
              </p>
            </div>

            <div className="mt-6 pt-5 border-t border-slate-100">
              <Link
                href="/backoffice/home/todo"
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-semibold text-xs py-3 px-5 rounded-2xl transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer"
              >
                <span>จัดการรายการงานทั้งหมด (To-Do List)</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
