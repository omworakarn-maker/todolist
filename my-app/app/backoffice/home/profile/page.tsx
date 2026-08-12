'use client'

import { useState, useEffect, useRef } from 'react'
import { useAnimatedAlert } from '../../../components/AnimatedAlert'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../../lib/supabase'

export default function Profile() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { showAlert } = useAnimatedAlert()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) throw error

      if (user) {
        setName(user.user_metadata?.name || '')
        setEmail(user.email || '')

        // Load saved profile image from localStorage
        const savedImage = localStorage.getItem(`profile_img_${user.email}`)
        if (savedImage) {
          setProfileImage(savedImage)
        }
      }
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      showAlert({
        title: 'ขนาดไฟล์ใหญ่เกินไป',
        text: 'โปรดเลือกรูปภาพที่มีขนาดไม่เกิน 5MB',
        icon: 'warning',
        confirmButtonColor: '#4f46e5'
      })
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      const base64String = reader.result as string
      setProfileImage(base64String)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveImage = () => {
    setProfileImage(null)
    if (email) {
      localStorage.removeItem(`profile_img_${email}`)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      showAlert({
        title: 'กรุณากรอกชื่อ-นามสกุล',
        icon: 'warning',
        confirmButtonColor: '#4f46e5'
      })
      return
    }

    if (password && password !== confirmPassword) {
      showAlert({
        title: 'รหัสผ่านไม่ตรงกัน',
        text: 'โปรดป้อนยืนยันรหัสผ่านใหม่ให้ตรงกัน',
        icon: 'warning',
        confirmButtonColor: '#4f46e5'
      })
      return
    }

    try {
      const updateData: any = {
        data: { name }
      }

      // If email changed, we can update it (Supabase will send confirmation email by default)
      if (email) {
        updateData.email = email
      }

      if (password.trim()) {
        updateData.password = password
      }

      const { error } = await supabase.auth.updateUser(updateData)

      if (error) throw error

      // Save profile image to localStorage
      if (profileImage && email) {
        localStorage.setItem(`profile_img_${email}`, profileImage)
      }

      showAlert({
        title: 'บันทึกข้อมูลเรียบร้อย',
        text: 'อัปเดตข้อมูลส่วนตัวและรูปโปรไฟล์สำเร็จแล้ว',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      })

      setPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      showAlert({
        title: 'เกิดข้อผิดพลาด',
        text: err.message,
        icon: 'error',
        confirmButtonColor: '#4f46e5'
      })
    }
  }

  const initial = name ? name.charAt(0).toUpperCase() : 'U'

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] text-slate-800 p-6 md:p-10 font-sans">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* Minimal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200/70">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              แก้ไขข้อมูลส่วนตัว
            </h1>
            <p className="text-slate-600 font-medium text-sm mt-1">จัดการข้อมูลบัญชี รหัสผ่าน และรูปโปรไฟล์ของคุณ</p>
          </div>
          <span className="self-start sm:self-auto text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3.5 py-1.5 rounded-full">
            👤 บัญชีผู้ใช้
          </span>
        </div>

        {/* User Card Showcase (Minimal White with Avatar Uploader) */}
        <div className="bg-white border border-slate-200/70 text-slate-900 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col sm:flex-row items-center gap-6 relative overflow-hidden">
          
          {/* Avatar Container with Upload Overlay */}
          <div className="relative group shrink-0">
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-3xl bg-indigo-50 border-2 border-indigo-200 flex items-center justify-center overflow-hidden shadow-sm relative">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl md:text-4xl font-extrabold text-indigo-600">
                  {initial}
                </span>
              )}

              {/* Upload Overlay Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-slate-900/60 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-xs font-bold gap-1 backdrop-blur-xs"
                title="คลิกเพื่ออัปโหลดรูปภาพใหม่"
              >
                <span className="text-xl">📷</span>
                <span>เปลี่ยนรูป</span>
              </button>
            </div>

            {/* Change badge under photo */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-2 -right-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white p-2 rounded-2xl shadow-md border-2 border-white transition-all cursor-pointer"
              title="เปลี่ยนรูปโปรไฟล์"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>

          <div className="space-y-2 text-center sm:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-slate-900">
                {name || 'ผู้ใช้งานระบบ'}
              </h2>
            </div>
            <p className="text-slate-500 text-xs md:text-sm font-mono font-semibold">
              {email || 'email'}
            </p>

            <div className="pt-1 flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-bold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
              >
                📷 อัปโหลดรูปภาพใหม่
              </button>

              {profileImage && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="text-xs font-bold text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
                >
                  🗑️ ลบรูปภาพ
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Profile Edit Form Card */}
        <form onSubmit={handleSave} className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200/70 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-lg font-extrabold text-slate-900">
              รายละเอียดข้อมูลส่วนตัว
            </h3>
            <p className="text-slate-500 text-xs mt-0.5">กรุณาตรวจสอบความถูกต้องของข้อมูลก่อนบันทึก</p>
          </div>

          <div className="space-y-5">
            {/* Name Input */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between">
                <span>ชื่อ - นามสกุล <span className="text-red-500">*</span></span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="กรอกชื่อ-นามสกุลของคุณ..."
                className="w-full px-4 py-3.5 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm md:text-base font-semibold text-slate-900 transition-all bg-white placeholder:text-slate-400"
              />
            </div>

            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                อีเมล (Email)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="กรอกอีเมล..."
                className="w-full px-4 py-3.5 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm md:text-base font-semibold text-slate-900 transition-all bg-white placeholder:text-slate-400"
              />
            </div>

            {/* Password Divider */}
            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-base font-extrabold text-slate-900">เปลี่ยนรหัสผ่าน (Optional)</h4>
                  <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200/80 px-3 py-1 rounded-xl mt-1.5 inline-block font-medium">
                    💡 หากไม่ต้องการเปลี่ยนรหัสผ่าน สามารถเว้นว่างไว้ได้เลยครับ
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
                >
                  {showPassword ? '🙈 ซ่อนรหัสผ่าน' : '👁️ แสดงรหัสผ่าน'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* New Password */}
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    รหัสผ่านใหม่
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="ป้อนรหัสผ่านใหม่ (ถ้าต้องการเปลี่ยน)"
                    className="w-full px-4 py-3.5 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm md:text-base font-semibold text-slate-900 transition-all bg-white placeholder:text-slate-400"
                  />
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    ยืนยันรหัสผ่านใหม่
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="ป้อนยืนยันรหัสผ่านใหม่อีกครั้ง"
                    className="w-full px-4 py-3.5 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm md:text-base font-semibold text-slate-900 transition-all bg-white placeholder:text-slate-400"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-extrabold text-sm md:text-base px-8 py-3.5 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              <span>💾 บันทึกการเปลี่ยนแปลง</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  )
}
