import { Button } from "react-bootstrap"
import { useState, useNavigate } from "react"
import  Form  from "react-bootstrap/Form"
import Table from "react-bootstrap/Table"
import { PremiosDB } from "../services/userServices"
import Modal from 'react-bootstrap/Modal';


export const Agregar = (() => {
const [input,setInput] = useState([])
const [nombre,setNombre] = useState('')
const [genero,setGenero] = useState('')
const [telefonos,setTelefonos] = useState('')
const navigate = useNavigate
const negocio = JSON.parse(localStorage.getItem('negocio'))
 const premios = JSON.parse(localStorage.getItem('premios'))
 const user = JSON.parse(localStorage.getItem('user'))

 if(!user) { return navigate('/')}



function inputsis(e) {
e.preventDefault()
let principales = [nombre,genero,telefonos]
console.log(principales)
let _input = [...input]
_input[e.target.id] = e.target.value
setInput(_input)
localStorage.setItem('negocio',JSON.stringify(principales))
localStorage.setItem('premios',JSON.stringify(_input))
PremiosDB(_input, principales) 
console.log(principales)
}

console.log(negocio)
console.log(premios)

  return(
    <div className="container">
      <h1>Registra tu Empresa</h1>
      <Form > 
        <Form.Label>
        <h2>logo</h2>
        </Form.Label>
      <input  type="file" accept="image/*" ></input><br />
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
        <Button variant="outline-light" style={{}} type="submit" onClick={inputsis}>Agregar</Button>
    
      </Form>
      
       <div
      className="modal show"
      style={{ display: 'block', position: 'initial' }}
    >
      <Modal.Dialog>
        <Modal.Header closeButton>
          <Modal.Title>Modal title</Modal.Title>
        </Modal.Header>

        <Modal.Body>
        <Table striped bordered hover>
      <thead>
        <tr>
          <th>
            <h3></h3>
            </th>
        <th>
          <h3></h3>
          </th>
          </tr>
        <tr>
          <th>premios</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td></td>
          <td></td>
         
        </tr>
        <tr>
          <td></td>
          <td></td> 
        </tr>
        <tr>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <td></td>
          <td></td>
        </tr>
        </tbody>
    </Table>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary">Close</Button>
          <Button variant="outline-secondary"  type="submit" onClick={inputsis}>Confirmar</Button>
        </Modal.Footer>
      </Modal.Dialog>
    </div>

    </div>
  )

})