import axios from "axios"


export const userServices = async (name, email, password) =>{
    const login = await axios.get('http://localhost:5500/userRuleta')
    

return(
    console.log(login.data)
)
}

export const creaUsuario = async (name, email, password) => { 
  const usuariosNuevos = await axios.post('http://localhost:5500/userRuleta',
  {
    name: name,
    email: email,
    password: password
  })

  return usuariosNuevos.data
  

}

export const Login = async ( email, password) => { 
    try{
    const logins = await axios.post('http://localhost:5500/userRuleta/login',
    {
      
      email: email,
      password: password
    })
    return logins.data;
}catch(error) {
    return console.log(null);
}
  
  }

  export const PremiosDB = async ( ) => { 
    try{
    const premios = await axios.post('http://localhost:5500/userRuleta/',
    {
      
    
    })
    return premios.data;
}catch(error) {
    return console.log(null);
}
  
  }