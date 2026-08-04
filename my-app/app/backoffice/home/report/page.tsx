'use client'

import { supabase } from '../../../../lib/supabase'
import { useEffect, useState } from 'react'
import Swal from 'sweetalert2'

interface TodoItem {
  id: number
  name: string
  remark: string
  status: string
}

export default function Report() {
  const [todos, setTodos] = useState<TodoItem[]>([])
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const initUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
      }
    }
    initUser()
  }, [])

  useEffect(() => {
    if (userId) {
      fetchData()
    }
  }, [userId])

  const fetchData = async () => {
    if (!userId) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('Todo')
        .select('*')
        .eq('member_id', userId)
        .order('id', { ascending: false })

      if (error) throw error
      setTodos(data || [])
    } catch (err: any) {
      Swal.fire({
        title: 'เกิดข้อผิดพลาด',
        text: err.message,
        icon: 'error',
        confirmButtonColor: '#4f46e5'
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'doing': return 'กำลังทำ'
      case 'success': return 'เสร็จแล้ว'
      default: return 'รอทำ'
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const countWait = todos.filter(t => t.status !== 'doing' && t.status !== 'success').length
  const countDoing = todos.filter(t => t.status === 'doing').length
  const countSuccess = todos.filter(t => t.status === 'success').length
  const total = todos.length

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] text-slate-800 p-6 md:p-10 font-sans print:bg-white print:p-0">
      <div className="max-w-5xl mx-auto space-y-8 print:space-y-4">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200/70 print:border-none print:shadow-none print:p-0">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              รายงานสรุปผลการปฏิบัติงาน
            </h1>
            <p className="text-slate-600 font-medium text-sm mt-1 print:hidden">
              ดูภาพรวมและพิมพ์รายงานสรุปผลงานทั้งหมด
            </p>
          </div>
          
          <button 
            onClick={handlePrint}
            className="print:hidden flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-sm transition-all"
          >
            <i className="fa fa-print"></i> พิมพ์รายงาน
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4 print:grid-cols-4">
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-center">
            <div className="text-sm font-semibold text-slate-500 mb-1">งานทั้งหมด</div>
            <div className="text-3xl font-bold text-slate-800">{total}</div>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-center">
            <div className="text-sm font-semibold text-emerald-600 mb-1">เสร็จแล้ว</div>
            <div className="text-3xl font-bold text-emerald-700">{countSuccess}</div>
          </div>
          <div className="bg-sky-50 border border-sky-200 p-4 rounded-2xl text-center">
            <div className="text-sm font-semibold text-sky-600 mb-1">กำลังทำ</div>
            <div className="text-3xl font-bold text-sky-700">{countDoing}</div>
          </div>
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl text-center">
            <div className="text-sm font-semibold text-amber-600 mb-1">รอทำ</div>
            <div className="text-3xl font-bold text-amber-700">{countWait}</div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/70 overflow-hidden print:border-none print:shadow-none print:rounded-none">
          {loading ? (
            <div className="p-12 text-center text-slate-400">
              <i className="fa fa-spinner fa-spin text-2xl mb-2 text-indigo-500"></i>
              <p>กำลังโหลดข้อมูล...</p>
            </div>
          ) : todos.length === 0 ? (
            <div className="p-16 text-center text-slate-400">
              ไม่มีข้อมูลรายงาน
            </div>
          ) : (
            <table className="w-full text-left border-collapse print:text-sm">
              <thead>
                <tr className="border-b-2 border-slate-200 bg-slate-50 text-slate-800 text-sm font-bold print:bg-transparent print:border-slate-800">
                  <th className="py-3 px-6 w-16 text-center">ลำดับ</th>
                  <th className="py-3 px-6">รายการที่ต้องทำ</th>
                  <th className="py-3 px-6">หมายเหตุ</th>
                  <th className="py-3 px-6 w-32 text-center">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 print:divide-slate-300">
                {todos.map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="py-3 px-6 text-center text-slate-500">{index + 1}</td>
                    <td className="py-3 px-6 font-semibold text-slate-900">{item.name}</td>
                    <td className="py-3 px-6 text-slate-600">{item.remark || '-'}</td>
                    <td className="py-3 px-6 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${
                        item.status === 'success' ? 'bg-emerald-100 text-emerald-800 border-emerald-200 print:border-none print:bg-transparent print:p-0' :
                        item.status === 'doing' ? 'bg-sky-100 text-sky-800 border-sky-200 print:border-none print:bg-transparent print:p-0' :
                        'bg-amber-100 text-amber-800 border-amber-200 print:border-none print:bg-transparent print:p-0'
                      }`}>
                        {getStatusText(item.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  )
}
