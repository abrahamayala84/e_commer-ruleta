import axios from "axios"

export const userServices = async (name, email, password) =>{
    const login = await axios.get('http://localhost:3000/userRuleta')
    

return(
    console.log(login.data)
)
}

export const creaUsuario = async (name, email, password) => { 
  const usuariosNuevos = await axios.post('http://localhost:3000/userRuleta',
  {
    name: name,
    email: email,
    password: password
  })

  return usuariosNuevos.data

}