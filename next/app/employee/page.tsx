'use client'
import { supabaseBrowser } from '@/lib/supabaseClient'
import { useEffect, useState } from 'react'

export default function EmployeePage() {
  const supabase = supabaseBrowser()
  const [vendors, setVendors] = useState<any[]>([])
  const [date, setDate] = useState<string>('')
  const [vendorId, setVendorId] = useState<string>('')
  const [msg, setMsg] = useState('')

  useEffect(()=>{
    setDate(new Date().toISOString().slice(0,10))
    supabase.from('vendors').select('vendor_id,name').order('name').then(({data})=> setVendors(data||[]))
  },[])

  const place = async () => {
    setMsg('')
    const { data: session } = await supabase.auth.getSession()
    const uid = session.session?.user.id
    if (!uid || !date || !vendorId) { setMsg('값을 입력하세요'); return }
    const { data: exist } = await supabase.from('orders').select('id,status').eq('date', date).eq('user_id', uid).maybeSingle()
    if (!exist) await supabase.from('orders').insert({ date, user_id: uid, vendor_id: vendorId, status: 'ordered' })
    else await supabase.from('orders').update({ vendor_id: vendorId, status:'ordered' }).eq('id', exist.id)
    setMsg('주문 완료')
  }
  const cancel = async () => {
    setMsg('')
    const { data: session } = await supabase.auth.getSession()
    const uid = session.session?.user.id
    await supabase.from('orders').delete().eq('date', date).eq('user_id', uid)
    setMsg('취소 완료')
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-3">
      <h1 className="text-lg font-semibold">직원 주문</h1>
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs">주문 날짜</label>
          <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-xs">도시락 업체</label>
          <select value={vendorId} onChange={e=>setVendorId(e.target.value)} className="border rounded px-3 py-2 min-w-[220px]">
            <option value="">업체 선택</option>
            {vendors.map(v => <option key={v.vendor_id} value={v.vendor_id}>{v.name} ({v.vendor_id})</option>)}
          </select>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-brand text-white rounded" onClick={place}>주문</button>
          <button className="px-4 py-2 border rounded" onClick={cancel}>취소</button>
        </div>
      </div>
      {msg && <p className="text-sm text-slate-600">{msg}</p>}
    </div>
  )
}


