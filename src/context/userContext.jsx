import { createContext, useState } from "react";


export const UserContext = createContext()

export  default ({children}) => {
    const [userContex, setUserContext] = useState('')
    const [tokenContext, setTokenContext] = useState('') 
    const [user, setUser] = useState(null)
    const [token, setToken] = useState(null)

    const savedUser = (user) => {
       localStorage.setItem('user', JSON.stringify(user))
       return setUser(JSON.parse(localStorage.getItem(user))) 
    }


    const deletedUser = () => {
        localStorage.removeItem('user')
        return setUser(null)
        
    }

    return(
        <UserContext.Provider value={{userContex, setUserContext,tokenContext,setTokenContext,savedUser,deletedUser}} >
            {children}
        </UserContext.Provider>
    )
}