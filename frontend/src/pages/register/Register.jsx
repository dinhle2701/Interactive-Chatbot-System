import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import UserPool from '..//../lib/cognito.js' // chỉnh lại path cho đúng
import { CognitoUserAttribute } from 'amazon-cognito-identity-js'

const Register = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  const handleRegister = (e) => {
    e.preventDefault()

    const attributeList = [
      new CognitoUserAttribute({
        Name: 'email',
        Value: email,
      }),
    ]

    UserPool.signUp(email, password, attributeList, null, (err, result) => {
      if (err) {
        setMessage(`❌ ${err.message || JSON.stringify(err)}`)
      } else {
        setMessage('✅ Login successfullt! Verify redirecting...')
        setTimeout(() => {
          navigate('/verify')
        }, 1500)
      }
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-200 px-4 sm:px-6 lg:px-8 font-[family-name:var(--font-geist-sans)]">
      <div className="w-full max-w-md space-y-6 bg-white p-8 shadow-md rounded-md">
        <h1 className="text-2xl font-bold text-center">Đăng ký</h1>

        <form onSubmit={handleRegister} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="w-full border border-gray-300 px-5 py-3 rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            name="password"
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
            Đăng ký
          </button>
        </form>

        {message && (
          <p className="text-sm text-center mt-4 text-red-600">{message}</p>
        )}

        <p className="text-center mt-4">
          Đã có tài khoản?{' '}
          <a href="/login" className="text-amber-500 hover:underline">
            Đăng nhập
          </a>
        </p>
      </div>
    </div>
  )
}

export default Register
