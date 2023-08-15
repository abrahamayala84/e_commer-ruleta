
import { Button } from "react-bootstrap"
import { useState, useNavigate,useEffect } from "react"
import  Form  from "react-bootstrap/Form"
import Table from "react-bootstrap/Table"
import { PremiosDB } from "../services/userServices"

export const Agregar = (() => {
const [input,setInput] = useState([])
const [logo,setLogo] = useState('')
const [nombre,setNombre] = useState('')
const [genero,setGenero] = useState('')
const [telefonos,setTelefonos] = useState('')
const navigate = useNavigate
const negocio = JSON.parse(localStorage.getItem('negocio'))
 const premios = JSON.parse(localStorage.getItem('premios'))
 const user = JSON.parse(localStorage.getItem('user'))

function inputsis(e) {
e.preventDefault()
let principales = [logo,nombre,genero,telefonos]
let _input = [...input]
_input[e.target.id] = e.target.value
setInput(_input)
localStorage.setItem('negocio',JSON.stringify(principales))
localStorage.setItem('premios',JSON.stringify(_input))
PremiosDB(_input, principales) 
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
      <input type="file" onChange={e => setLogo(e.target.files[0])}></input><br />
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
        
       <div className="negocios"><h1></h1>
       <h2>{negocio[0]}</h2>
       </div>
       <div>
       <Table striped bordered hover>
      <thead>
        <tr>
          <th>
            <h3>{negocio[0]}</h3>
            </th>
        <th>
          <h3>{negocio[2]}</h3>
          </th>
          <th>
          <h3>logo</h3>
          </th>
          <th>
          <h3></h3>
          </th>
          </tr>
        
        <tr>
          <th>#</th>
          <th>premios</th>
          <th>Premios</th>
          <th>Editar</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>1 y 2</td>
          <td>{premios[0]}</td>
          <td>{premios[1]}</td>
          <td><Button>Editar</Button></td>
          <td><Button>borrar</Button></td>
        </tr>
        <tr>
          <td>3 Y 4</td>
          <td>{premios[2]}</td>
          <td>{premios[3]}</td>
          <td><Button>Editar</Button></td>
          <td><Button>borrar</Button></td>
        </tr>
        <tr>
        <td>5 y 6</td>
          <td>{premios[4]}</td>
          <td>{premios[5]}</td>
          <td><Button>Editar</Button></td>
          <td><Button>borrar</Button></td>
        </tr>
        <tr>
        <td>7 y 8</td>
          <td>{premios[6]}</td>
          <td>{premios[7]}</td>
          <td><Button>Editar</Button></td>
          <td><Button>borrar</Button></td>
        </tr>
        <tr>
        <td>9 y 10</td>
          <td>{premios[8]}</td>
          <td>{premios[9]}</td>
          <td><Button>Editar</Button></td>
          <td><Button>borrar</Button></td>
        </tr>
        <tr>
        <td>11 y 12</td>
          <td>{premios[10]}</td>
          <td>{premios[11]}</td>
          <td><Button>Editar</Button></td>
          <td><Button>borrar</Button></td>
        </tr>
        </tbody>
    </Table>
       </div>
       

    </div>
  )

})