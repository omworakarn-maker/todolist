'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { Config } from '../../signup/config'
import Swal from 'sweetalert2'
import { useRouter } from 'next/navigation'

export default function Profile() {
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const router = useRouter()

  useEffect(() => {
    fetchData()
  }, [])

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
        setUsername(res.data.username)
      }
    } catch (err) {
      Swal.fire({
        title: 'error',
        text: (err as Error).message,
        icon: 'error'
      })
    }
  }

  const handleSave = async () => {
    try {
      if (password !== confirmPassword) throw new Error('โปรดป้อนยืนยันรหัสผ่านให้ตรงกัน')

      const payload = {
        name: name,
        username: username,
        password: password
      }

      const token = localStorage.getItem('token')
      const headers = {
        'Authorization': 'Bearer ' + token
      }
      const url = Config.apiUrl + '/members/update'
      await axios.put(url, payload, { headers })

      Swal.fire({
        title: 'save',
        text: 'บันทึกข้อมูลแล้ว',
        icon: 'success',
        timer: 1000
      })
    } catch (err) {
      Swal.fire({
        title: 'error',
        text: (err as Error).message,
        icon: 'error'
      })
    }
  }

  return (
    <div className="flex flex-col gap-4 mx-auto mt-10 border ⬜ border-gray-400 p-4 rounded-lg">
      <div className="text-xl font-bold">แก้ไขข้อมูลส่วนตัว</div>
      <div>
        <div>ชื่อ</div>
        <input className="input" value={name}
          onChange={((e) => setName(e.target.value))} />
      </div>
      <div>
        <div>Username</div>
        <input className="input" value={username}
          onChange={((e) => setUsername(e.target.value))} />
      </div>
      <div>
        <div>password</div>
        <input type="password" className="input"
          onChange={((e) => setPassword(e.target.value))} />
      </div>
      <div>
        <div>ยืนยัน password (* หากไม่ต้องการเปลี่ยน ไม่ต้องกรอกข้อมูล)</div>
        <input type="password" className="input"
          onChange={((e) => setConfirmPassword(e.target.value))} />
      </div>
      <div>
        <button onClick={handleSave} className="button">
          Save
        </button>
      </div>
    </div>
  )
}