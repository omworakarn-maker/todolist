'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { Config } from '../../signup/config'
import Swal from 'sweetalert2'

export default function Dashboard() {
  const [countWait, setCountWait] = useState(0)
  const [countDoing, setCountDoing] = useState(0)
  const [countSuccess, setCountSuccess] = useState(0)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token')
      const headers = {
        'Authorization': 'Bearer ' + token
      }
      const url = Config.apiUrl + '/todo/dashboard'
      const res = await axios.get(url, { headers })

      if (res.status === 200) {
        setCountWait(res.data.countWait)
        setCountDoing(res.data.countDoing)
        setCountSuccess(res.data.countSuccess)
      }
    } catch (err) {
      Swal.fire({
        title: 'error',
        text: (err as Error).message,
        icon: 'error'
      })
    }
  }

  return (
    <div className="p-6 w-full bg-white text-gray-900">
      <div className="text-2xl font-bold mb-6 text-gray-900">Dashboard</div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Count Wait */}
        <div className="border border-gray-200 bg-gray-50 text-gray-700 p-6 rounded-xl text-end shadow-sm hover:shadow-md transition-shadow">
          <div className="text-lg font-medium text-gray-500">รอทำ</div>
          <div className="text-4xl font-bold text-gray-800 mt-2">{countWait}</div>
        </div>

        {/* Count Doing */}
        <div className="border border-teal-200 bg-teal-50/70 text-teal-700 p-6 rounded-xl text-end shadow-sm hover:shadow-md transition-shadow">
          <div className="text-lg font-medium text-teal-600">กำลังทำ</div>
          <div className="text-4xl font-bold text-teal-700 mt-2">{countDoing}</div>
        </div>

        {/* Count Success */}
        <div className="border border-indigo-200 bg-indigo-50/70 text-indigo-700 p-6 rounded-xl text-end shadow-sm hover:shadow-md transition-shadow">
          <div className="text-lg font-medium text-indigo-600">ทำเสร็จแล้ว</div>
          <div className="text-4xl font-bold text-indigo-700 mt-2">{countSuccess}</div>
        </div>
      </div>
    </div>
  )
}