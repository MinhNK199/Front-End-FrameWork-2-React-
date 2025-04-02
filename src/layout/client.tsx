import React, { createContext, useState } from 'react'
import ClientHeader from '../components/client/header'
import ClientFooter from '../components/client/footer'
import { Outlet } from 'react-router-dom'
import CartProvider from '../context/Cart'

const ClientLayout = () => {
  
  return (
    <CartProvider>      
        <ClientHeader/>
        <div className='max-w-7xl mx-auto'>
          <Outlet/>
          </div>
        <ClientFooter/>
    </CartProvider>
  )
}

export default ClientLayout