'use client'

import { Config } from '../../signup/config'
import axios from 'axios'
import { useEffect, useState } from 'react'
import Swal from 'sweetalert2'

export default function Todo() {
  const [name, setName] = useState('')
  const [remark, setRemark] = useState('')
  const [id, setId] = useState(0)
  const [todos, setTodos] = useState([])
  const [statusList, setStatusList] = useState([
    { value: 'all', text: 'ทุกสถานะ' },
    { value: 'wait', text: 'รอทำ' },
    { value: 'doing', text: 'กำลังทำ' },
    { value: 'success', text: 'ทำเสร็จแล้ว' }
])
const [status, setStatus] = useState('all')

    useEffect(() => {
    fetchData()
    }, [])

    useEffect(() => {
    filterData()
    }, [status])

    const filterData = async () => {
    try {
        const url = Config.apiUrl + '/todo/filter/' + status
        const token = localStorage.getItem('token')
        const headers = {
        'Authorization': 'Bearer ' + token
        }

        const res = await axios.get(url, { headers })

        if (res.status === 200) {
        setTodos(res.data)
        }
    } catch (err) {
        Swal.fire({
        title: 'error',
        text: (err as Error).message,
        icon: 'error'
        })
    }
    }

    const fetchData = async () => {
    try {
        const url = Config.apiUrl + '/todo/list'
        const token = localStorage.getItem('token')
        const headers = {
        'Authorization': 'Bearer ' + token
        }
        const res = await axios.get(url, { headers })

        if (res.status === 200) {
        setTodos(res.data)
        }
    } catch (err) {
        Swal.fire({
        title: 'error',
        text: (err as Error).message,
        icon: 'error'
        })
    }
    }

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token')
      const headers = {
        'Authorization': 'Bearer ' + token
      }
      const payload = {
        name: name,
        remark: remark
      }
      if (id === 0) {
       const url = Config.apiUrl + '/todo/create'
       await axios.post(url, payload, { headers })
      } else {
        const urlEdit = Config.apiUrl + '/todo/update/' + id
        await axios.put(urlEdit, payload, { headers })

      }
      

      Swal.fire({
        title: 'save',
        text: 'บันทึกรายการสำเร็จ',
        icon: 'success',
        timer: 1000
      })
        fetchData()
        setName('')
        setRemark('')
        setId(0)
    } catch (err) {
      Swal.fire({
        title: 'error',
        text: (err as Error).message,
        icon: 'error'
      })
    }
  }

    const handleEdit = (todo: { id: number, name: string, remark: string }) => {
        setId(todo.id)
        setName(todo.name)
        setRemark(todo.remark)
    }  

    const handleRemove = async (id: number) => {
        const confirmButton = await Swal.fire({
            title: 'ลบรายการ',
            text: 'คุณต้องการลบรายการใช่หรือไม่ ?',
            icon: 'question',
            showConfirmButton: true,
            showCancelButton: true
        })

        if (confirmButton.isConfirmed) {
            const url = Config.apiUrl + '/todo/remove/' + id
            const token = localStorage.getItem('token')
            const headers = {
            'Authorization': 'Bearer ' + token
            }
            await axios.delete(url, { headers })
            fetchData()
        }
    }

    const updateStatus = async (id: number, status: string) => {
        try {
            const url = Config.apiUrl + '/todo/updateStatus/' + id
            const token = localStorage.getItem('token')
            const headers = {
            'Authorization': 'Bearer ' + token
            }
            const payload = {
            status: status
            }

            await axios.put(url, payload, { headers })

            fetchData()
        } catch (err) {
            Swal.fire({
            title: 'error',
            text: (err as Error).message,
            icon: 'error'
            })
        }
    }

    const statusText = (status: string) => {
        if (status == 'wait' || status == 'use') return 'รอทำ'
        if (status == 'doing') return 'กำลังทำ'
        if (status == 'success') return 'ทำเสร็จแล้ว'
    }

  return (
    <div className="flex flex-col w-full">
        <div className="border ⬜ border-gray-400 m-5 w-full">
        <div className="text-xl font-bold bg-gray-400 p-4">บันทึกรายการ</div>
        <div className="p-4 flex flex-col gap-4">
            <div>
            <div>ชื่อสิ่งที่ต้องทำ</div>
            <input className="input" value={name}
                onChange={((e) => setName(e.target.value))} />
            </div>
            <div>
            <div>หมายเหตุ</div>
            <input className="input" value={remark}
                onChange={((e) => setRemark(e.target.value))} />
            </div>
            <div>
            <button className="button" onClick={handleSave}>
                Save
            </button>
            </div>
        </div>
    </div>

    <div className="m-5 flex gap-2 items-center">
    <span className="w-[180px]">เลือกสถานะของงาน</span>
    <select className="input" onChange={((e) => setStatus(e.target.value))}>
        {statusList.map((item) => (
        <option key={item.value} value={item.value}>
            {item.text}
        </option>
        ))}
    </select>
    </div>

    <div className="table m-5">
    <table className="bg-gray-400">
        <thead>
        <tr>
            <th className="p-2 w-[250px] text-start">รายการที่ต้องทำ</th>
            <th className="p-2 text-start">หมายเหตุ</th>
            <th className="p-2 text-center">สถานะ</th>
            <th className="p-2 w-[370px]">จัดการ</th>
        </tr>
        </thead>
        <tbody>
        {todos.map((item: { id: number, name: string, remark: string }) => (
            <tr key={item.id} className="bg-gray-200 border border-b-1">
            <td className="p-2">{item.name}</td>
            <td className="p-2">{item.remark}</td>
            <td className="p-2 text-center">{statusText(item.status)}</td>
            <td className="text-center p-2">
                <div className="flex gap-2">
                <button onClick={() => updateStatus(item.id, 'use')} className="bg-amber-500 text-white px-4 py-2 rounded-md">รอดำเนิน</button>
                <button onClick={() => updateStatus(item.id, 'doing')} className="bg-indigo-600 text-white px-4 py-2 rounded-md">กำลังทำ</button>
                <button onClick={() => updateStatus(item.id, 'success')} className="bg-emerald-600 text-white px-4 py-2 rounded-md">ทำแล้ว</button>
                <button onClick={(e) => handleEdit(item)} className="bg-sky-600 text-white px-4 py-2 rounded-md">
                    <i className="fa fa-pencil"></i>
                </button>
                <button onClick={(e) => handleRemove(item.id)} className="bg-red-500 text-white px-4 py-2 rounded-md">
                    <i className="fa fa-times"></i>
                </button>
                </div>
            </td>
            </tr>
        ))}
        </tbody>
    </table>
    </div>
    </div>
  )
}