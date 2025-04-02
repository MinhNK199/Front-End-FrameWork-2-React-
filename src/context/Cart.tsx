import React, { createContext, ReactNode, useReducer, useState } from 'react'
import { reducer } from '../reducers/count'
import { cartReducer } from '../reducers/cartreducer'
import { ICart } from '../interface/cart'
import ProductsInCart from '../components/client/carts/productsincart'

type Props = {
    children:ReactNode
}
export const cartContext = createContext({} as any)
const CartProvider = ({children}: Props) => {
    const cartinit:ICart ={
      carts:[],
      isOpenCart:false
    } 
    // const [count,setCount] = useState<number>(1)
    // const [count,dispatch] = useReducer(reducer,0)
    const [cartstate,dispatch] = useReducer(cartReducer,cartinit)
  return (
    <cartContext.Provider value={{cartstate,dispatch}}>
        {children}
        {(cartstate.isOpenCart)&&<ProductsInCart/>}
    </cartContext.Provider>
  )
}

export default CartProvider