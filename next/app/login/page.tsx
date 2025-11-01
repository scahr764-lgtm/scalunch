'use client'
import { supabaseBrowser } from '@/lib/supabaseClient'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const supabase = supabaseBrowser()
  const r = useRouter()
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [msg, setMsg] = useState('')

  const onLogin = async () => {
    setMsg('')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: pw })
    if (error) { setMsg(error.message); return }
    // fetch role
    const uid = data.user?.id
    const { data: prof } = await supabase.from('profiles').select('role').eq('id', uid).maybeSingle()
    if (prof?.role === 'admin') r.push('/admin'); else r.push('/employee')
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
      <h1 className="text-lg font-semibold mb-4">로그인</h1>
      <div className="space-y-3">
        <input className="w-full border rounded px-3 py-2" placeholder="이메일" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="w-full border rounded px-3 py-2" placeholder="비밀번호" type="password" value={pw} onChange={e=>setPw(e.target.value)} />
        <button className="px-4 py-2 bg-brand text-white rounded" onClick={onLogin}>로그인</button>
        {msg && <p className="text-sm text-rose-600">{msg}</p>}
      </div>
    </div>
  )
}


