import React, { useContext } from 'react'
import { cartContext } from '../../../context/Cart'
import { CartActionType, IProductCart } from '../../../interface/cart'
import { CloseOutlined } from '@ant-design/icons'

const ProductsInCart = () => {
  const { cartstate, dispatch } = useContext(cartContext)
  return (
    <div className='carts bg-white border fixed top-0 right-0 w-[400px] h-screen'>
      <button onClick={() => dispatch({ type: CartActionType.ChangeStatusCart, payload: false })}><CloseOutlined /></button>
      <ul>
        {(cartstate.carts) &&
          cartstate.carts.map((item: IProductCart) => (
            <li>{item.productId.name} SL: {item.quantity}</li>
          ))
        }
      </ul>
    </div>
  )
}

export default ProductsInCart