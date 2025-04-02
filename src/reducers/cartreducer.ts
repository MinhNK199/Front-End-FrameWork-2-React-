import { CartActionType, ICart } from "../interface/cart";

export const cartReducer = (state:ICart,action:{type:CartActionType,payload:any})=>{
    switch (action.type){
        case CartActionType.UpdateCart:
            return {...state,carts:action.payload}
        case CartActionType.ChangeStatusCart:
            return {...state,isOpenCart:action.payload}
        default:
            return state
    }
}