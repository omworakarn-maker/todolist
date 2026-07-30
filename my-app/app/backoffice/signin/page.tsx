'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Swal from 'sweetalert2'
import { Config } from '../signup/config'
import axios from 'axios'
import Particles from '../Particles'
import '../signup/signup.css'

export default function SignIn() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleSignIn = async () => {
    setIsLoading(true)
    try {
      const payload = {
        username: username,
        password: password
      }
      const url = Config.apiUrl + '/members/signin'
      const res = await axios.post(url, payload)

      if (res.status === 200) {
        localStorage.setItem('token', res.data.token)
        await new Promise((resolve) => setTimeout(resolve, 1500));
        router.push('/backoffice/home')
        
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          Swal.fire({
            title: 'Sign In',
            text: 'username invalid',
            icon: 'warning',
            timer: 2000
          })
        }
      } else {
        Swal.fire({
          title: 'error',
          text: (err as Error).message,
          icon: 'error'
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUp = () => {
    router.push('/backoffice/signup')
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-black flex items-center justify-center">

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
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                placeholder="Enter your username"
                onChange={(e) => setUsername(e.target.value)}
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
