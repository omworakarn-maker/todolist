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

export default function Todo() {
  const [name, setName] = useState('')
  const [remark, setRemark] = useState('')
  const [id, setId] = useState(0)
  const [todos, setTodos] = useState<TodoItem[]>([])
  const [status, setStatus] = useState('all')
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  const statusList = [
    { value: 'all', text: 'ทั้งหมด', color: 'slate' },
    { value: 'wait', text: 'รอทำ', color: 'amber' },
    { value: 'doing', text: 'กำลังทำ', color: 'sky' },
    { value: 'success', text: 'ทำเสร็จแล้ว', color: 'emerald' }
  ]

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
      filterData()
    }
  }, [status, userId])

  const filterData = async () => {
    if (status === 'all') {
      fetchData()
      return
    }
    setLoading(true)
    try {
      let queryStatus = status
      if (status === 'wait') queryStatus = 'use'

      const { data, error } = await supabase
        .from('Todo')
        .select('*')
        .eq('user_id', userId)
        .eq('status', queryStatus)
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

  const fetchData = async () => {
    if (!userId) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('Todo')
        .select('*')
        .eq('user_id', userId)
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      Swal.fire({
        title: 'กรุณากรอกชื่อสิ่งที่ต้องทำ',
        icon: 'warning',
        confirmButtonColor: '#4f46e5'
      })
      return
    }

    try {
      if (id === 0) {
        const { error } = await supabase.from('Todo').insert({
          name,
          remark,
          status: 'use',
          user_id: userId
        })
        if (error) throw error
      } else {
        const { error } = await supabase.from('Todo').update({
          name,
          remark
        }).eq('id', id).eq('user_id', userId)
        if (error) throw error
      }

      Swal.fire({
        title: id === 0 ? 'สร้างรายการสำเร็จ' : 'แก้ไขรายการสำเร็จ',
        text: 'ข้อมูลถูกบันทึกเรียบร้อยแล้ว',
        icon: 'success',
        timer: 1200,
        showConfirmButton: false
      })

      fetchData()
      handleCancelEdit()
    } catch (err: any) {
      Swal.fire({
        title: 'เกิดข้อผิดพลาด',
        text: err.message,
        icon: 'error',
        confirmButtonColor: '#4f46e5'
      })
    }
  }

  const handleEdit = (todo: TodoItem) => {
    setId(todo.id)
    setName(todo.name)
    setRemark(todo.remark)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCancelEdit = () => {
    setId(0)
    setName('')
    setRemark('')
  }

  const handleRemove = async (targetId: number) => {
    const confirmButton = await Swal.fire({
      title: 'ยืนยันการลบรายการ',
      text: 'คุณต้องการลบรายการนี้ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ลบรายการ',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      customClass: {
        popup: 'rounded-3xl'
      }
    })

    if (confirmButton.isConfirmed) {
      try {
        const { error } = await supabase.from('Todo').delete().eq('id', targetId).eq('user_id', userId)
        if (error) throw error
        
        Swal.fire({
          title: 'ลบสำเร็จ',
          text: 'ลบรายการเรียบร้อยแล้ว',
          icon: 'success',
          timer: 1000,
          showConfirmButton: false
        })

        fetchData()
      } catch (err: any) {
        Swal.fire({
          title: 'เกิดข้อผิดพลาด',
          text: err.message,
          icon: 'error',
          confirmButtonColor: '#4f46e5'
        })
      }
    }
  }

  const updateStatus = async (targetId: number, newStatus: string) => {
    try {
      const { error } = await supabase.from('Todo').update({ status: newStatus }).eq('id', targetId).eq('user_id', userId)
      if (error) throw error
      fetchData()
    } catch (err: any) {
      Swal.fire({
        title: 'เกิดข้อผิดพลาด',
        text: err.message,
        icon: 'error',
        confirmButtonColor: '#4f46e5'
      })
    }
  }

  const getStatusBadge = (itemStatus: string) => {
    switch (itemStatus) {
      case 'doing':
        return (
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-sky-100 text-sky-900 border border-sky-300">
            <span className="w-2 h-2 rounded-full bg-sky-600 animate-pulse"></span>
            กำลังทำ
          </span>
        )
      case 'success':
        return (
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            เสร็จแล้ว
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
            <span className="w-2 h-2 rounded-full bg-amber-600"></span>
            รอทำ
          </span>
        )
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] text-slate-800 p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Minimal Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200/70">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              จัดการรายการงาน (To-Do List)
            </h1>
            <p className="text-slate-600 font-medium text-sm mt-1">เพิ่ม แก้ไข และติดตามสถานะงานของคุณอย่างสะดวกรวดเร็ว</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs md:text-sm font-bold text-slate-800 bg-slate-100 px-4 py-2 rounded-2xl border border-slate-200">
              รวมทั้งหมด {todos.length} รายการ
            </span>
          </div>
        </div>

        {/* Bright Minimal Add/Edit Form Card */}
        <form onSubmit={handleSave} className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200/70 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600 font-bold text-lg">
                {id === 0 ? '📝' : '✏️'}
              </span>
              <h2 className="text-lg font-bold text-slate-900">
                {id === 0 ? 'เพิ่มรายการงานใหม่' : 'แก้ไขรายการงาน'}
              </h2>
            </div>
            {id !== 0 && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="text-xs font-semibold text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
              >
                ✕ ยกเลิกการแก้ไข
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                ชื่อสิ่งที่ต้องทำ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="เช่น ประชุมสรุปงานประจำสัปดาห์..."
                className="w-full px-4 py-3 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm md:text-base font-semibold text-slate-900 transition-all bg-white placeholder:text-slate-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                หมายเหตุ / รายละเอียด
              </label>
              <input
                type="text"
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                placeholder="เช่น เตรียมเอกสารประกอบการประชุมก่อน 10:00 น."
                className="w-full px-4 py-3 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm md:text-base font-semibold text-slate-900 transition-all bg-white placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="submit"
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-semibold text-sm px-6 py-3 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              <span>{id === 0 ? '➕ บันทึกรายการใหม่' : '💾 อัปเดตข้อมูล'}</span>
            </button>
          </div>
        </form>

        {/* Filter Pills & Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 md:p-5 rounded-3xl shadow-sm border border-slate-200/70">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <span className="text-xs font-bold text-slate-400 mr-2 uppercase tracking-wider">กรองสถานะ:</span>
            {statusList.map((item) => {
              const isActive = status === item.value
              return (
                <button
                  key={item.value}
                  onClick={() => setStatus(item.value)}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  {item.text}
                </button>
              )
            })}
          </div>

          <button
            onClick={fetchData}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-2xl transition-all cursor-pointer"
          >
            <svg className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>รีเฟรช</span>
          </button>
        </div>

        {/* Clean Bright Task List / Table */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/70 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-400 text-sm">
              <svg className="w-8 h-8 animate-spin mx-auto text-indigo-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              กำลังโหลดข้อมูล...
            </div>
          ) : todos.length === 0 ? (
            <div className="p-16 text-center text-slate-400 space-y-3">
              <div className="text-4xl">📭</div>
              <p className="text-sm font-semibold text-slate-600">ยังไม่มีรายการงานในระบบ</p>
              <p className="text-xs text-slate-400">คุณสามารถเพิ่มรายการใหม่ได้จากฟอร์มด้านบน</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-100/80 text-slate-800 text-xs uppercase tracking-wider font-extrabold">
                    <th className="py-4 px-6 w-1/3">รายการที่ต้องทำ</th>
                    <th className="py-4 px-6">หมายเหตุ / รายละเอียด</th>
                    <th className="py-4 px-6 text-center w-36">สถานะปัจจุบัน</th>
                    <th className="py-4 px-6 text-right w-72">เปลี่ยนสถานะ & จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-900">
                  {todos.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                      {/* Title */}
                      <td className="py-4 px-6 font-extrabold text-slate-900 text-base">
                        {item.name}
                      </td>

                      {/* Remark */}
                      <td className="py-4 px-6 text-slate-700 text-sm font-medium">
                        {item.remark || <span className="text-slate-400 font-normal italic">- ไม่มี -</span>}
                      </td>

                      {/* Status Badge */}
                      <td className="py-4 px-6 text-center whitespace-nowrap">
                        {getStatusBadge(item.status)}
                      </td>

                      {/* Quick Actions */}
                      <td className="py-4 px-6 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Quick Status Changers */}
                          <button
                            onClick={() => updateStatus(item.id, 'use')}
                            title="เปลี่ยนสถานะเป็น: รอทำ"
                            className={`p-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                              item.status === 'wait' || item.status === 'use'
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : 'bg-slate-100 hover:bg-amber-50 text-slate-500 hover:text-amber-600'
                            }`}
                          >
                            ⏳
                          </button>

                          <button
                            onClick={() => updateStatus(item.id, 'doing')}
                            title="เปลี่ยนสถานะเป็น: กำลังทำ"
                            className={`p-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                              item.status === 'doing'
                                ? 'bg-sky-100 text-sky-800 border border-sky-300'
                                : 'bg-slate-100 hover:bg-sky-50 text-slate-500 hover:text-sky-600'
                            }`}
                          >
                            ⚡
                          </button>

                          <button
                            onClick={() => updateStatus(item.id, 'success')}
                            title="เปลี่ยนสถานะเป็น: ทำเสร็จแล้ว"
                            className={`p-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                              item.status === 'success'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-slate-100 hover:bg-emerald-50 text-slate-500 hover:text-emerald-600'
                            }`}
                          >
                            ✅
                          </button>

                          <div className="h-4 w-px bg-slate-200 mx-1"></div>

                          {/* Edit Button */}
                          <button
                            onClick={() => handleEdit(item)}
                            title="แก้ไขรายการ"
                            className="p-2 rounded-xl bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 border border-transparent hover:border-indigo-200 transition-all cursor-pointer"
                          >
                            ✏️
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => handleRemove(item.id)}
                            title="ลบรายการ"
                            className="p-2 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 border border-transparent hover:border-red-200 transition-all cursor-pointer"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}