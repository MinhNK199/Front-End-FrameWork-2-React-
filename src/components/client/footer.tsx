import React, { useContext } from 'react'
import { cartContext } from '../../context/Cart'

const ClientFooter = () => {
  const [count,dispatch] = useContext(cartContext)
  return (
    <div>ClientFooter <button onClick={()=>dispatch({type:"giam"})}>Tăng</button></div>
  )
}

export default ClientFooter