import { Button } from "bootstrap"
import { useState, useEffect } from "react"
import { getPremios, userServices } from "../services/userServices"



export const Agregar = ()=> {
    const [premios, setPremios] = useState(["","","","","","","","","","","",""])
    const [user, setUser] = useState('')
    const [nombre, setNombre] = useState('')
   
    
   getPremios().then(function (data) {
    console.log('hola',data.premioss[12].nombre)
   })
         
    const saveUser = (user) => {
        localStorage.setItem('premios', JSON.stringify(user))
        return setUser(JSON.parse(localStorage.getItem(premios))) 
     }
    
    function handleValue (e){
        let  _premios = [...premios]
      _premios[parseInt(e.target.id)-1]= e.target.value 
       setPremios(_premios)
       console.log(_premios)

     }
const dataPremios = ((e) => {
    let  _premios = [...premios]
    let nombres = nombre
    saveUser(_premios)
   setPremios(_premios)
   setNombre(nombre)
  
    console.log(_premios) 
    
})


return(
<div>
     <label>nombre de la empresa</label>
     <input value={nombre} type="text" onChange={(e) => setNombre(e.target.value)}/><br />

<input id="1" onChange={handleValue} value={`${premios[0]}`} type="text" />
<input id="2" onChange={handleValue} value={premios[1]} type="text" />
<input id="3" onChange={handleValue} value={premios[2]} type="text" />
<input id="4" onChange={handleValue} value={premios[3]} type="text" />
<input id="5" onChange={handleValue} value={premios[4]} type="text" />
<input id="6" onChange={handleValue} value={premios[5]} type="text" />
<input id="7" onChange={handleValue} value={premios[6]} type="text" />
<input id="8" onChange={handleValue} value={premios[7]} type="text" />
<input id="9" onChange={handleValue} value={premios[8]} type="text" />
<input id="10" onChange={handleValue} value={premios[9]} type="text" />
<input id="11" onChange={handleValue} value={premios[10]} type="text" />
<input id="12" onChange={handleValue} value={premios[11]} type="text"/> 


<button onClick={dataPremios}>agregar</button>
<div>{localStorage.getItem('premios')}</div>
<div>{}</div>
        </div>
)}