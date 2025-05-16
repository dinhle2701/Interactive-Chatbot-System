'use client'

import React, { useState } from 'react'
import UserPool from '@/lib/cognito'
import { CognitoUser } from 'amazon-cognito-identity-js'
import { useRouter } from 'next/navigation'

const VerifyPage = () => {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [message, setMessage] = useState('')

  const handleVerify = (e) => {
    e.preventDefault()

    const userData = {
      Username: email,
      Pool: UserPool
    }

    const cognitoUser = new CognitoUser(userData)

    cognitoUser.confirmRegistration(code, true, (err, result) => {
      if (err) {
        setMessage(`❌ ${err.message || JSON.stringify(err)}`)
      } else {
        setMessage('✅ Verification successful! Redirecting to login...')
        // Sau 1s chuyển về trang login
        setTimeout(() => {
          router.push('/login')
        }, 1000)
      }
    })
  }

  return (
    <div className='verify'>
      <div className="min-h-screen bg-gray-200 flex items-center justify-center px-4 sm:px-6 lg:px-8 font-[family-name:var(--font-geist-sans)]">
        <div className="w-full max-w-md space-y-6 bg-white p-8 shadow-md rounded-md">
          <h1 className="text-2xl font-bold text-center">Verify Your Account</h1>

          <form onSubmit={handleVerify} className="space-y-4">
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              className="w-full px-5 py-3 rounded"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="text"
              name="code"
              placeholder="Enter verification code"
              className="w-full px-5 py-3 rounded"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />

            <button
              type="submit"
              className="w-full bg-amber-400 hover:bg-amber-500 hover:cursor-pointer text-white font-semibold py-3 px-5 rounded transition duration-300"
            >
              Verify
            </button>
            <a href="/login">Đã có tài khoản</a>
          </form>

          {message && (
            <div className="text-sm text-center mt-4 text-red-600">{message}</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default VerifyPage
