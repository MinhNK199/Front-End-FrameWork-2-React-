import React, { useContext } from 'react'
import { IProduct } from '../../../interface/product'
import StarRating from './starrating'
import { cartContext } from '../../../context/Cart'
import { api } from '../../../config/axios'
import { CartActionType } from '../../../interface/cart'
import { message } from 'antd'

type Props = {
    product:IProduct
}

const ProductItem = ({product}: Props) => {
  const {dispatch} = useContext(cartContext)
  const AddToCart = async (id:number)=>{
    const token = localStorage.getItem("token")
    const config = {
        headers: {"Authorization":"Bearer "+token}
    }
    const cartdata = {
          "productId":id,
          "quantity":1
      }
    try {
      const {data} = await api.post('carts',cartdata,config)
      // console.log(data);
      dispatch({type:CartActionType.UpdateCart,payload:data.data.Items}) 
      message.success(data.message)  
      dispatch({type:CartActionType.ChangeStatusCart,payload:true})    
    } catch (error) {
      
    }
  }
  return (
    <div className='product-item'>
        <img src={product.images}/>
        <h3>{product.name}</h3>
        <span>{product.price}</span>
        <StarRating score={product.score}/>
        <button onClick={()=>AddToCart(product.id)} className='bg-red-700 text-white px-4 py-1 rounded'>Thêm giỏ hàng</button>
    </div>
  )
}

export default ProductItem