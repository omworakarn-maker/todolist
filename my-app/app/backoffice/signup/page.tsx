'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Swal from 'sweetalert2'
import { Config } from './config'
import axios from 'axios'
import Particles from '../Particles'
import './signup.css'

export default function SignUp() {
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()

  const handleSignUp = async () => {
    setIsLoading(true)
    try {
      const url = Config.apiUrl + '/members/signup'

      const payload = {
        name: name,
        username: username,
        password: password
      }

      const res = await axios.post(url, payload)

      if (res.status === 200) {
        localStorage.setItem('token', res.data.token)
        await new Promise((resolve) => setTimeout(resolve, 1500));
        router.push('/backoffice/signin')
      }
    } catch (err: unknown) {
      Swal.fire({
        title: 'error',
        text: (err as Error).message,
        icon: 'error'
      })
    }finally {
      setIsLoading(false)
    }
  }

  const handleSignIn = () => {
    router.push('/backoffice/signin')
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

      {/* UIVERSE STYLED SIGN UP FORM */}
      <div className="relative z-10 px-4 w-full flex justify-center">
        <div className="form-container">
          <div className="text-2xl font-bold text-white mb-2 text-center">
            Sign Up
          </div>

          <div className="form">
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                type="text"
                placeholder="Enter your name"
                onChange={(e) => setName(e.target.value)}
              />
            </div>

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

            <button
              className="form-submit-btn min-h-[44px]"
              onClick={handleSignUp}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="loader"></span>
              ) : (
                <>
                  <i className="fa fa-check mr-2"></i>
                  Submit
                </>
              )}
            </button>

            <button
              className="form-signin-btn"
              onClick={handleSignIn}
            >
              <i className="fa fa-sign-in mr-2"></i>
              Sign In
            </button>

          </div>
        </div>
      </div>

    </div>
  )
}
