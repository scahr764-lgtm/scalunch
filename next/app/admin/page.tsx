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
  
  // 일괄 주문 관련 상태
  const [employees, setEmployees] = useState<any[]>([])
  const [selectedDates, setSelectedDates] = useState<string[]>([])
  const [newDateInput, setNewDateInput] = useState('')
  const [selectedVendor, setSelectedVendor] = useState('')
  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set())
  const [bulkOrderMsg, setBulkOrderMsg] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'bulk-order' | 'vendors' | 'users'>('bulk-order')

  const load = async () => {
    const { data } = await supabase.from('vendors').select('vendor_id,name').order('name')
    setVendors(data||[])
  }
  
  const loadEmployees = async () => {
    const { data } = await supabase.from('users').select('user_id,email,name').eq('role', 'employee').order('name')
    setEmployees(data||[])
  }
  
  useEffect(()=>{ 
    load()
    loadEmployees()
  },[])

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

  // 날짜 추가
  const addDate = () => {
    if (!newDateInput) {
      setBulkOrderMsg('날짜를 입력하세요')
      return
    }
    const date = newDateInput
    if (selectedDates.includes(date)) {
      setBulkOrderMsg('이미 추가된 날짜입니다')
      return
    }
    setSelectedDates([...selectedDates, date].sort())
    setNewDateInput('')
    setBulkOrderMsg('')
  }

  // 날짜 제거
  const removeDate = (date: string) => {
    setSelectedDates(selectedDates.filter(d => d !== date))
  }

  // 직원 선택 토글
  const toggleEmployee = (userId: string) => {
    const newSet = new Set(selectedEmployees)
    if (newSet.has(userId)) {
      newSet.delete(userId)
    } else {
      newSet.add(userId)
    }
    setSelectedEmployees(newSet)
  }

  // 전체 선택/해제
  const toggleAllEmployees = () => {
    if (selectedEmployees.size === employees.length) {
      setSelectedEmployees(new Set())
    } else {
      setSelectedEmployees(new Set(employees.map(e => e.user_id)))
    }
  }

  // 일괄 주문 실행
  const placeBulkOrders = async () => {
    setBulkOrderMsg('')
    if (!selectedVendor) {
      setBulkOrderMsg('업체를 선택하세요')
      return
    }
    if (selectedDates.length === 0) {
      setBulkOrderMsg('날짜를 선택하세요')
      return
    }
    if (selectedEmployees.size === 0) {
      setBulkOrderMsg('주문할 직원을 선택하세요')
      return
    }

    setIsLoading(true)
    setBulkOrderMsg('주문 처리 중...')

    try {
      const orders: any[] = []
      for (const date of selectedDates) {
        for (const userId of selectedEmployees) {
          // 기존 주문 확인
          const { data: existing } = await supabase
            .from('orders')
            .select('id')
            .eq('date', date)
            .eq('user_id', userId)
            .maybeSingle()

          if (!existing) {
            orders.push({
              date,
              user_id: userId,
              vendor_id: selectedVendor,
              status: 'ordered'
            })
          }
        }
      }

      if (orders.length > 0) {
        const { error } = await supabase.from('orders').insert(orders)
        if (error) {
          setBulkOrderMsg(`오류: ${error.message}`)
        } else {
          setBulkOrderMsg(`성공: ${orders.length}개의 주문이 생성되었습니다`)
          setSelectedEmployees(new Set())
          setSelectedDates([])
          setNewDateInput('')
          setSelectedVendor('')
        }
      } else {
        setBulkOrderMsg('생성할 새 주문이 없습니다 (모두 이미 주문됨)')
      }
    } catch (error: any) {
      setBulkOrderMsg(`오류 발생: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* 사이드바 */}
      <aside className="w-full md:w-64 bg-white rounded-lg shadow p-4">
        <h2 className="font-semibold mb-4 text-base border-b border-slate-200 pb-2">관리자 메뉴</h2>
        <nav className="space-y-2">
          <button 
            onClick={() => setActiveTab('bulk-order')}
            className={`w-full text-left px-4 py-2.5 rounded-lg transition-colors ${
              activeTab === 'bulk-order' 
                ? 'bg-slate-900 text-white font-medium' 
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
            }`}
          >
            일괄 주문 관리
          </button>
          <button 
            onClick={() => setActiveTab('vendors')}
            className={`w-full text-left px-4 py-2.5 rounded-lg transition-colors ${
              activeTab === 'vendors' 
                ? 'bg-slate-900 text-white font-medium' 
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
            }`}
          >
            업체 관리
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`w-full text-left px-4 py-2.5 rounded-lg transition-colors ${
              activeTab === 'users' 
                ? 'bg-slate-900 text-white font-medium' 
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
            }`}
          >
            직원 계정 관리
          </button>
        </nav>
      </aside>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 space-y-6">
        {/* 일괄 주문 섹션 */}
        {activeTab === 'bulk-order' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="font-semibold mb-4 text-lg">일괄 주문 관리</h2>
            
            {/* 날짜 선택 */}
            <div className="mb-4 p-4 bg-slate-50 rounded">
              <h3 className="font-medium mb-3">1. 주문 날짜 선택</h3>
              <div className="flex flex-wrap gap-3 items-end mb-3">
                <div>
                  <label className="block text-xs mb-1">날짜 추가</label>
                  <input 
                    type="date" 
                    value={newDateInput} 
                    onChange={e=>setNewDateInput(e.target.value)} 
                    className="border rounded px-3 py-2"
                  />
                </div>
                <button 
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  onClick={addDate}
                >
                  날짜 추가
                </button>
              </div>
              {selectedDates.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm text-slate-600 mb-2">선택된 날짜 ({selectedDates.length}개):</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedDates.map(date => (
                      <span key={date} className="flex items-center gap-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        {date}
                        <button 
                          onClick={() => removeDate(date)}
                          className="hover:text-red-600 font-bold"
                          type="button"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

        {/* 업체 선택 */}
        <div className="mb-4 p-4 bg-slate-50 rounded">
          <h3 className="font-medium mb-3">2. 도시락 업체 선택</h3>
          <select 
            value={selectedVendor} 
            onChange={e=>setSelectedVendor(e.target.value)} 
            className="border rounded px-3 py-2 min-w-[300px]"
          >
            <option value="">업체를 선택하세요</option>
            {vendors.map(v => (
              <option key={v.vendor_id} value={v.vendor_id}>
                {v.name} ({v.vendor_id})
              </option>
            ))}
          </select>
        </div>

        {/* 직원 선택 */}
        <div className="mb-4 p-4 bg-slate-50 rounded">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium">3. 주문할 직원 선택</h3>
            <button 
              className="text-sm px-3 py-1 border rounded hover:bg-slate-200"
              onClick={toggleAllEmployees}
            >
              {selectedEmployees.size === employees.length ? '전체 해제' : '전체 선택'}
            </button>
          </div>
          <div className="max-h-64 overflow-y-auto border rounded p-2">
            {employees.length === 0 ? (
              <p className="text-sm text-slate-500 py-4 text-center">직원이 없습니다</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {employees.map(emp => (
                  <label key={emp.user_id} className="flex items-center gap-2 p-2 hover:bg-slate-100 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedEmployees.has(emp.user_id)}
                      onChange={() => toggleEmployee(emp.user_id)}
                      className="cursor-pointer"
                    />
                    <span className="text-sm">{emp.name || emp.email}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
          <p className="text-sm text-slate-600 mt-2">
            선택된 직원: {selectedEmployees.size}명 / 전체: {employees.length}명
          </p>
        </div>

            {/* 주문 실행 */}
            <div className="flex gap-3 items-center">
              <button 
                className="px-6 py-2 bg-brand text-white rounded hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={placeBulkOrders}
                disabled={isLoading || !selectedVendor || selectedDates.length === 0 || selectedEmployees.size === 0}
              >
                {isLoading ? '처리 중...' : '일괄 주문 실행'}
              </button>
              {bulkOrderMsg && (
                <p className={`text-sm ${bulkOrderMsg.includes('오류') || bulkOrderMsg.includes('필요') ? 'text-red-600' : 'text-green-600'}`}>
                  {bulkOrderMsg}
                </p>
              )}
            </div>
          </div>
        )}

        {/* 업체 관리 섹션 */}
        {activeTab === 'vendors' && (
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
        )}

        {/* 직원 계정 관리 섹션 */}
        {activeTab === 'users' && (
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
        )}
      </div>
    </div>
  )
}


