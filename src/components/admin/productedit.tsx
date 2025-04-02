import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query'
import axios from 'axios'
import React from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { IProduct } from '../../interface/product'
import { api } from '../../config/axios'

const ProductEdit = () => {
    const {register,handleSubmit,reset} = useForm<IProduct>()
    const params = useParams()
    const {data,isLoading} = useQuery<IProduct>({
        queryKey: ["product",params.id],
        queryFn: async()=>{
            const {data:product} = await api.get(`products/${params.id}`)
            // reset(product)
            return product
        }
    })
    const queryclient = useQueryClient()
    const navigate = useNavigate()
    const mutation = useMutation({
        mutationFn: async(product:IProduct)=>{
            try {
                const {data} =await axios.put(`http://localhost:4000/products/${params.id}`,product)
                return data
            } catch (error) {
                console.log(error);                
            }
        },
        onSuccess:(response)=>{
            alert("Cập nhật thành công")
            console.log(response);            
            queryclient.invalidateQueries({queryKey:["products"]})
            navigate("/dashboard/product-list")
        }        
    })
const onSubmit = (product:IProduct)=>{
    mutation.mutate(product)
}
    if (isLoading){
        return <>Đang tải</>
    }
  return (
    <div>
        <h1>Sửa sản phẩm</h1>
        <form onSubmit={handleSubmit(onSubmit)} className='max-w-xl mx-auto flex flex-col gap-2 [&_input]:border [&_input]:px-2 [&_input]:py-1 [&_input]:rounded'>
            <input type='text' {...register("name",{value:data?.name})} placeholder='Tên sản phẩm'/>
            <input type='text' {...register("images",{value:data?.images})} placeholder='Ảnh sản phẩm'/>
            <input type='text' {...register("price",{value:data?.price})} placeholder='Giá sản phẩm'/>
            <button>Sửa</button>
        </form>
    </div>
  )
}

export default ProductEdit