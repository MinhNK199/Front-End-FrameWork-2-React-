import React, { createContext, ReactNode, useReducer } from 'react'

import { ICart } from '../interface/cart'
import { cartReducer } from '../reducers/cartReducer'

type Props = {
  children: ReactNode
}
export const cartContext = createContext([] as any)
const CartProvider = ({ children }: Props) => {
  // const [count,setCount] = useState<number>(1)
  const cartInit: ICart = {
    carts: [],
    isOpenCart: false
  }
  // const [count,dispatch] = useReducer(reducer,0)
  const [cartState, dispatch] = useReducer(cartReducer, cartInit)
  return (
    <cartContext.Provider value={[cartState, dispatch]}>
      {children}
      {(cartState.isOpenCart) && <ProductInCart />}
    </cartContext.Provider>
  )
}

export default CartProvider