import React from 'react'
import { IUser } from '../../../interface/user'
import { useQueryClient, useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { api } from '../../../config/axios'
import { message } from 'antd'

const Login = () => {
    const {register,handleSubmit} = useForm<IUser>()
    const queryclient = useQueryClient()
    const navigate = useNavigate()
    const mutation = useMutation({
        mutationFn: async(userdata:IUser)=>{
            try {
                const {data} =await api.post(`login`,userdata)
                return data
            } catch (error) {
                console.log(error);                
            }
        },
        onSuccess:(response)=>{
            console.log(response);
            localStorage.setItem("token",response.accessToken)            
           message.success("Đăng nhập thành công")
            navigate("/")
        }        
    })
const onSubmit = (userdata:IUser)=>{
    mutation.mutate(userdata)
}
  return (
    <div>
        <h1>Đăng nhập</h1>
        <form onSubmit={handleSubmit(onSubmit)} className='max-w-xl mx-auto flex flex-col gap-2 [&_input]:border [&_input]:px-2 [&_input]:py-1 [&_input]:rounded'>
            <input type='text' {...register("email")} placeholder='Email'/>
            <input type='text' {...register("password")} placeholder='Mật khẩu'/>
            <button>Đăng nhập</button>
        </form>
    </div>
  )
}

export default Login