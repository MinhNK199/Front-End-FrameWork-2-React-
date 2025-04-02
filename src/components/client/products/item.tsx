import React, { useContext } from 'react'
import { IProduct } from '../../../interface/product'
import StarRating from './starrating'
import { cartContext } from '../../../context/Cart'

type Props = {
    product:IProduct
}

const ProductItem = ({product}: Props) => {
  const [count,setCount] = useContext(cartContext)
  const AddToCart = (id:number)=>{
    setCount(count+1)
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