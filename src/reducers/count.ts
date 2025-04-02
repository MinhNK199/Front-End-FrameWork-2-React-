export const reducer = (state:number,action:{type:string})=>{
    switch (action.type){
        case "tang":
          return state+1
        case "giam":
         return state-1
        default:
         return state
    }
}