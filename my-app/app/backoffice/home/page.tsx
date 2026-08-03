'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import Link from 'next/link'

export default function Home() {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) throw error

      if (user) {
        setName(user.user_metadata?.name || user.email?.split('@')[0] || '')
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] text-slate-800 p-6 md:p-10 font-sans flex flex-col">
      <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col justify-center pb-20">
        
        {/* Welcome Banner */}
        <div className="bg-white rounded-3xl p-10 md:p-14 text-slate-900 shadow-sm relative overflow-hidden flex flex-col md:flex-row items-center justify-between border border-slate-200/70">
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 w-full">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-2xl text-slate-400 shadow-sm">
              <i className="fa fa-user"></i>
            </div>
            
            <div className="text-center md:text-left flex-1">
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2 text-slate-900">
                ยินดีต้อนรับกลับมา, <span className="text-indigo-600">{loading ? '...' : name || 'ผู้ใช้งาน'}</span>
              </h1>
              <p className="text-slate-500 text-base max-w-2xl font-medium leading-relaxed">
                ภาพรวมของระบบและทางลัดเพื่อเข้าถึงฟังก์ชันต่างๆ เริ่มต้นทำงานของคุณได้จากเมนูด้านล่าง
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
          
          {/* Action 1: Dashboard */}
          <Link 
            href="/backoffice/home/dashboard"
            className="group bg-white rounded-3xl p-8 border border-slate-200/70 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer flex flex-col items-center text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center text-2xl mb-6 group-hover:scale-110 group-hover:bg-sky-500 group-hover:text-white transition-all duration-300 shadow-sm">
              <i className="fa fa-chart-pie"></i>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">ดูภาพรวม (Dashboard)</h3>
            <p className="text-sm text-slate-500">ติดตามความคืบหน้าและสัดส่วนของงานทั้งหมดในระบบแบบเรียลไทม์</p>
          </Link>

          {/* Action 2: Todo */}
          <Link 
            href="/backoffice/home/todo"
            className="group bg-white rounded-3xl p-8 border border-slate-200/70 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer flex flex-col items-center text-center relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-orange-500"></div>
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-2xl mb-6 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300 shadow-sm">
              <i className="fa fa-tasks"></i>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">จัดการงาน (To-Do List)</h3>
            <p className="text-sm text-slate-500">เพิ่มรายการงานใหม่ แก้ไข หรือปรับเปลี่ยนสถานะงานของคุณ</p>
          </Link>

          {/* Action 3: Report */}
          <Link 
            href="/backoffice/home/report"
            className="group bg-white rounded-3xl p-8 border border-slate-200/70 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer flex flex-col items-center text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl mb-6 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300 shadow-sm">
              <i className="fa fa-file-alt"></i>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">รายงานสรุป (Report)</h3>
            <p className="text-sm text-slate-500">สรุปผลการปฏิบัติงานทั้งหมด พร้อมรูปแบบที่เหมาะสมสำหรับการพิมพ์</p>
          </Link>

        </div>
      </div>
    </div>
  )
}