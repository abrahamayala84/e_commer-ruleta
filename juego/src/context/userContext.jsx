import { createContext, useState } from "react";


export const UserContext = createContext()

export  default ({children}) => {
    const [userContex, setUserContext] = useState(null)
    const [tokenContext, setTokenContext] = useState(null)

    const [ganador, setGanador] = useState(0)
    const [premios, setPremios] = useState(["","","","","","","","","","","",""])

    return(
        <UserContext.Provider value={{userContex, setUserContext,tokenContext,setTokenContext, ganador, setGanador, premios,setPremios}}>
            {children}
        </UserContext.Provider>
    )
}