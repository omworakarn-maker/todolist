'use client'

import { useState, useEffect } from 'react'

import { useAnimatedAlert } from './AnimatedAlert'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import PillNav from './PillNav'
import { supabase } from '../../lib/supabase'

export default function Sidebar() {
  const [name, setName] = useState('')
  const router = useRouter()
  const { showAlert } = useAnimatedAlert()

  const fetchData = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) throw error

      if (user) {
        // We stored the name in user metadata during sign up
        setName(user.user_metadata?.name || user.email?.split('@')[0] || 'User')
      } else {
        router.push('/backoffice/signin')
      }
    } catch (err: any) {
      console.error(err)
      router.push('/backoffice/signin')
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const signOut = async () => {
    const confirmButton = await showAlert({
      title: 'Signout',
      text: 'คุณต้องการออกจากระบบใช่ไหม',
      icon: 'question',
      showConfirmButton: true,
      showCancelButton: true
      ,confirmButtonText: 'ออกจากระบบ',
      cancelButtonText: 'ยกเลิก'
    })

    if (confirmButton.isConfirmed) {
      await supabase.auth.signOut()
      router.push('/backoffice/signin')
    }
  }

  const navItems = [
    { label: 'Dashboard', href: '/backoffice/home/dashboard', icon: 'fa fa-file-alt' },
    { label: 'บันทึกงาน', href: '/backoffice/home/todo', icon: 'fa fa-list' },
    { label: 'รายงานสรุป', href: '/backoffice/home/report', icon: 'fa fa-chart-bar' }
  ]

  return (
    <header className="w-full bg-white border-b border-gray-200 text-gray-900 px-6 py-3 shadow-sm sticky top-0 z-50 flex items-center justify-between gap-4">
      {/* LEFT: LOGO / BRAND & USER */}
      <div className="flex items-center gap-4">
        <Link 
          href="/backoffice/home/dashboard" 
          className="text-xl font-bold text-gray-900 hover:text-indigo-600 transition-colors cursor-pointer"
        >
          Todo List
        </Link>
        <div className="h-5 w-[1px] bg-gray-200 hidden sm:block"></div>
        <Link 
          href="/backoffice/home/profile" 
          className="flex items-center text-gray-600 hover:text-blue-600 font-medium text-sm transition-colors cursor-pointer"
          title="แก้ไขข้อมูลส่วนตัว"
        >
          <i className="fa fa-user mr-2 text-blue-600"></i>
          {name || 'Loading...'}
        </Link>
      </div>

      {/* CENTER: PILL NAVIGATION */}
      <div className="flex-1 max-w-lg mx-4 hidden md:block">
        <PillNav
          items={navItems}
          baseColor="#000000"
          pillColor="#f3f4f6"
          pillTextColor="#374151"
          hoveredPillTextColor="#ffffff"
        />
      </div>

      {/* RIGHT: EDIT & LOGOUT BUTTONS */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => router.push('/backoffice/home/profile')}
          className="px-3 py-1.5 rounded-lg border border-sky-400 bg-sky-50 text-sky-600 hover:bg-sky-100 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
        >
          <i className="fa fa-pencil"></i> Edit
        </button>
        <button
          onClick={signOut}
          className="px-3 py-1.5 rounded-lg border border-red-400 bg-red-50 text-red-600 hover:bg-red-100 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
        >
          <i className="fa fa-times"></i> Logout
        </button>
      </div>
    </header>
  )
}
