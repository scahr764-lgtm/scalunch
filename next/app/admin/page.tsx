'use client'
import { supabaseBrowser } from '@/lib/supabaseClient'
import { useEffect, useState } from 'react'

export default function AdminPage() {
  const supabase = supabaseBrowser()
  const [vendors, setVendors] = useState<any[]>([])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'employee'|'admin'>('employee')
  const [userMsg, setUserMsg] = useState('')

  const load = async () => {
    const { data } = await supabase.from('vendors').select('vendor_id,name').order('name')
    setVendors(data||[])
  }
  useEffect(()=>{ load() },[])

  const addVendor = async () => {
    if (!name) return;
    const { data: rows } = await supabase.from('vendors').select('vendor_id')
    const max = (rows||[]).map(r=>parseInt(String(r.vendor_id).replace(/^[Vv]/,'')||'0',10)).reduce((a,b)=>Math.max(a,b),0)
    const next = 'V' + String(max+1).padStart(3,'0')
    await supabase.from('vendors').insert({ vendor_id: next, name })
    setName('')
    load()
  }
  const delVendor = async (vid: string) => { await supabase.from('vendors').delete().eq('vendor_id', vid); load(); }

  const createUser = async () => {
    setUserMsg('')
    // NOTE: 실제 운영에서는 Next.js API Route에서 Service Role 키로 생성해야 합니다.
    setUserMsg('관리자 생성 API(Route)로 연결 필요 - 서버 키 보안')
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="font-semibold mb-3">업체 관리</h2>
        <div className="flex gap-2 mb-3">
          <input className="border rounded px-3 py-2" placeholder="업체명" value={name} onChange={e=>setName(e.target.value)} />
          <button className="px-4 py-2 bg-brand text-white rounded" onClick={addVendor}>추가</button>
        </div>
        <table className="w-full text-sm">
          <thead><tr className="bg-slate-100 text-left"><th className="p-2">VendorID</th><th className="p-2">Name</th><th className="p-2">Action</th></tr></thead>
          <tbody>
            {vendors.map(v=> (
              <tr key={v.vendor_id}><td className="p-2">{v.vendor_id}</td><td className="p-2">{v.name}</td>
                <td className="p-2"><button className="px-2 py-1 border rounded" onClick={()=>delVendor(v.vendor_id)}>삭제</button></td></tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="font-semibold mb-3">직원 계정 생성(관리자 전용)</h2>
        <div className="flex flex-wrap gap-2 items-end">
          <input className="border rounded px-3 py-2" placeholder="이메일" value={email} onChange={e=>setEmail(e.target.value)} />
          <select className="border rounded px-3 py-2" value={role} onChange={e=>setRole(e.target.value as any)}>
            <option value="employee">employee</option>
            <option value="admin">admin</option>
          </select>
          <button className="px-4 py-2 bg-brand text-white rounded" onClick={createUser}>계정 생성</button>
        </div>
        {userMsg && <p className="text-sm text-rose-600 mt-2">{userMsg}</p>}
      </div>
    </div>
  )
}


