import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signIn } from '../../lib/auth.js'  // chỉnh lại path cho đúng

const Login = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  const handleLogin = (e) => {
    e.preventDefault()

    signIn(email, password, (err, result) => {
      if (err) {
        setMessage(`❌ ${err.message || 'Login failed'}`)
      } else {
        setMessage('✅ Login successfully! Redirecting...')
        setTimeout(() => {
          navigate('/') // chuyển hướng sang trang Home
        }, 2000)
      }
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-200 px-4 sm:px-6 lg:px-8 font-[family-name:var(--font-geist-sans)]">
      <div className="w-full max-w-md space-y-6 bg-white p-8 shadow-md rounded-md">
        <h1 className="text-2xl font-bold text-center">Đăng nhập</h1>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full border border-gray-300 px-5 py-3 rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Mật khẩu"
            className="w-full border border-gray-300 px-5 py-3 rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            className="w-full bg-amber-400 hover:bg-amber-500 text-white font-semibold py-3 rounded cursor-pointer transition duration-300"
          >
            Đăng nhập
          </button>
        </form>

        {message && (
          <p className="text-sm text-center mt-4 text-red-600">{message}</p>
        )}

        <p className="text-center mt-4">
          Chưa có tài khoản?{' '}
          <a href="/register" className="text-amber-500 hover:underline">
            Đăng ký
          </a>
        </p>
      </div>
    </div>
  )
}

export default Login
