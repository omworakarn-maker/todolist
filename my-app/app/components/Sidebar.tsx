'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { Config } from '../backoffice/signup/config'
import Swal from 'sweetalert2'
import { useRouter } from 'next/navigation'
import PillNav from './PillNav'

export default function Sidebar() {
  const [name, setName] = useState('')
  const router = useRouter()

  const fetchData = async () => {
    try {
      const url = Config.apiUrl + '/members/info'
      const token = localStorage.getItem('token')
      const headers = {
        'Authorization': 'Bearer ' + token
      }

      const res = await axios.get(url, { headers })

      if (res.status === 200) {
        setName(res.data.name)
      }
    } catch (err) {
      Swal.fire({
        title: 'error',
        text: (err as Error).message,
        icon: 'error'
      })
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const signOut = async () => {
    const confirmButton = await Swal.fire({
      title: 'Signout',
      text: 'คุณต้องการออกจากระบบใช่ไหม',
      icon: 'question',
      showConfirmButton: true,
      showCancelButton: true
    })

    if (confirmButton.isConfirmed) {
      localStorage.removeItem('token')
      router.push('/backoffice/signin')
    }
  }

  const navItems = [
    { label: 'Dashboard', href: '/backoffice/home/dashboard', icon: 'fa fa-file-alt' },
    { label: 'บันทึกงาน', href: '/backoffice/home/todo', icon: 'fa fa-list' },
    { label: 'รายงานสรุป', href: '/dashboard/home/report', icon: 'fa fa-chart-bar' }
  ]

  return (
    <header className="w-full bg-white border-b border-gray-200 text-gray-900 px-6 py-3 shadow-sm sticky top-0 z-50 flex items-center justify-between gap-4">
      {/* LEFT: LOGO / BRAND & USER */}
      <div className="flex items-center gap-4">
        <div className="text-xl font-bold text-gray-900">
          Todo List
        </div>
        <div className="h-5 w-[1px] bg-gray-200 hidden sm:block"></div>
        <div className="flex items-center text-gray-600 font-medium text-sm">
          <i className="fa fa-user mr-2 text-blue-600"></i>
          {name || 'Loading...'}
        </div>
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