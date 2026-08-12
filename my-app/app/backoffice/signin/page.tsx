'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Swal from 'sweetalert2'
import SuccessModal from '../../components/SuccessModal'

import { supabase } from '../../../lib/supabase'
import Particles from '../Particles'
import '../signup/signup.css'

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSignIn = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      })

      if (error) {
        throw error
      }

      setIsSuccess(true)
      await new Promise((resolve) => setTimeout(resolve, 1400))
      router.replace('/backoffice/home/todo')
    } catch (err: any) {
      Swal.fire({
        title: 'Sign In Failed',
        text: err.message || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
        icon: 'warning',
        timer: 2000
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUp = () => {
    router.push('/backoffice/signup')
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-black flex items-center justify-center">
      {isSuccess && (
        <SuccessModal
          title="เข้าสู่ระบบสำเร็จ"
          message="ยินดีต้อนรับกลับมา ระบบพร้อมให้คุณจัดการรายการงานแล้ว"
          busy
        />
      )}

      {/* PARTICLES BACKGROUND */}
      <div className="absolute inset-0 z-0">
        <Particles
          particleColors={['#ffffff']}
          particleCount={400}
          particleSpread={10}
          speed={0.4}
          particleBaseSize={500}
          moveParticlesOnHover
          alphaParticles={false}
          disableRotation
          pixelRatio={1}
        />
      </div>

      {/* UIVERSE STYLED SIGN IN FORM */}
      <div className="relative z-10 px-4 w-full flex justify-center">
        <div className="form-container">
         <div className="text-2xl font-bold text-white mb-4 text-center">
            Welcome Back <br/>
            <span className="text-[15px] font-normal text-gray-400">Sign in to your account</span>
          </div>

          <div className="form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="relative w-full">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className="pr-10"
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white cursor-pointer bg-transparent border-none p-1"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i className={`fa ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>

            {/* ปุ่ม Sign In หลักพร้อมเอฟเฟกต์กระทะผัดไข่ Loader */}
            <button
              className="form-submit-btn min-h-[44px]"
              onClick={handleSignIn}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="loader"></span>
              ) : (
                <>
                  <i className="fa fa-sign-in mr-2"></i>
                  Sign In Now
                </>
              )}
            </button>

            {/* ปุ่ม Sign Up รอง (กลับไปหน้าสมัครสมาชิก) */}
            <button
              className="form-signin-btn"
              onClick={handleSignUp}
            >
              <i className="fa fa-user-plus mr-2"></i>
              Sign Up
            </button>
          </div>
        </div>
      </div>

    </div>
  )
}
