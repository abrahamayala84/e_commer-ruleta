
import { Button } from "react-bootstrap"
import { useState } from "react"
import  Form  from "react-bootstrap/Form"
import Table from "react-bootstrap/Table"

export const Agregar = (() => {
const [input,setInput] = useState([])
const [nombre,setNombre] = useState('')
const [genero,setGenero] = useState('')
const [telefonos,setTelefonos] = useState('')

 
function inputsis(e) {
e.preventDefault()
console.log(nombre,genero,telefonos)
let principales = [nombre,genero,telefonos]
let inputt = [...input]
let _input = [...inputt]
_input[e.target.id] = e.target.value
setInput(_input)
localStorage.setItem('negocio',JSON.stringify(principales))
localStorage.setItem('premios',JSON.stringify(_input)) 
console.log(input)
console.log(nombre,genero,telefonos,_input)
}

 const negocio = JSON.parse(localStorage.getItem('negocio'))

console.log(negocio)
 
  return(
    <div className="container">
      <h1>Registra tu Empresa</h1>

      <Form >
        <Form.Label>
        <h2>Nombre</h2>
        </Form.Label>
        <input value={nombre} onChange={e => setNombre(e.target.value)} type="text" className="form-control" placeholder="nombre"></input><br />
        <Form.Label>
        <h2>Telefonos</h2>
        </Form.Label>
        <input value={telefonos} onChange={e => setTelefonos(e.target.value)} type="text" className="form-control" placeholder="telefono"></input><br />
        <Form.Label><h2>Genero</h2></Form.Label>
        <input value={genero} onChange={e => setGenero(e.target.value)} type="text" className="form-control" placeholder="ej. Restaurante"></input>
        <br />
        <Form.Label><h2>Premios y Descuentos</h2></Form.Label><br />
        <Form.Label><h4>Posicion 1</h4></Form.Label>
        <input id='0' onChange={inputsis} name="inpust" type="text"></input>
        <Form.Label><h4>Posicion 2</h4></Form.Label>
        <input id='1' onChange={inputsis} name="inpust" type="text"></input>
        <Form.Label><h4>Posicion 3</h4></Form.Label>
        <input id='2' onChange={inputsis} name="inpust" type="text"></input>
        <Form.Label><h4>Posicion 4</h4></Form.Label>
        <input id='3' onChange={inputsis} name="inpust" type="text"></input>
        <Form.Label><h4>Posicion 5</h4></Form.Label>
        <input id='4' onChange={inputsis} name="inpust" type="text"></input>
        <Form.Label><h4>Posicion 6</h4></Form.Label>
        <input id='5' onChange={inputsis} name="inpust" type="text"></input>
        <Form.Label><h4>Posicion 7</h4></Form.Label>
        <input id='6' onChange={inputsis} name="inpust" type="text"></input>
        <Form.Label><h4>Posicion 8</h4></Form.Label>
        <input id='7' onChange={inputsis} name="inpust" type="text"></input>
        <Form.Label><h4>Posicion 9</h4></Form.Label>
        <input id='8' onChange={inputsis} name="inpust" type="text"></input>
        <Form.Label><h4>Posicion 10</h4></Form.Label>
        <input id='9' onChange={inputsis} name="inpust" type="text"></input>
        <Form.Label><h4>Posicion 11</h4></Form.Label>
        <input  id='10' onChange={inputsis}name="inpust" type="text"></input>
        <Form.Label ><h4>Posicion 12</h4></Form.Label>
        <input id='11' onChange={inputsis} name="inpust" type="text"></input>
        <br />
        <Button type="submit" onClick={inputsis}>Agregar</Button>
        </Form>
       <div className="negocios"><h1>{negocio[0]}</h1>
       <h2>{negocio[1]}</h2>
       <h3>{negocio[2]}</h3>
       </div>
       <div>
       <Table striped bordered hover>
      <thead>
        <tr>
          <th>#</th>
          <th>First Name</th>
          <th>Last Name</th>
          <th>Username</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>1</td>
          <td>Mark</td>
          <td>Otto</td>
          <td>@mdo</td>
        </tr>
        <tr>
          <td>2</td>
          <td>Jacob</td>
          <td>Thornton</td>
          <td>@fat</td>
        </tr>
        <tr>
          <td>3</td>
          <td colSpan={2}>Larry the Bird</td>
          <td>@twitter</td>
        </tr>
      </tbody>
    </Table>

       </div>
       

    </div>
  )

})