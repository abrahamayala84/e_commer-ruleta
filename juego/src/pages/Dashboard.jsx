

import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';

import { useEffect, useState } from 'react'
import { getPremios } from '../services/userServices'


export const Dashboard =  () => {
  const user = JSON.parse(localStorage.getItem('user'))
  console.log(user)
  const [Userdata, setdata] = useState([])

  useEffect(() => {
 getPremios()
  .then((premios) => {
  console.log(premios)
  setdata(premios.premioss[0].premios[0])
  console.log(premios)

})
 
  },[])

console.log(Userdata)
   
        return (
        < >  
        <header>
          <h3>Bienvenido al juego de la ruleta</h3>
          <p>Puedes agregar tu negocio o solo ljugar por premios</p>
          <Button variant="outline-warning" href="agregar">Agregar negocio</Button>
          </header><br />
         <Card border="warning" style={{ width: '18rem' }}>
        <Card.Header>{}</Card.Header>
        <Card.Body>
          <Card.Title>{}</Card.Title>
          <Card.Subtitle>Telefono:{}</Card.Subtitle>
          <br />
          <Card.Subtitle><h3>Premios</h3></Card.Subtitle>
          <Card.Text>{Userdata._input}</Card.Text>
          <Button variant="outline-warning" href="ruleta">Jugar</Button> 
        </Card.Body>
      
      </Card>
      <br />
      <Card border="info" style={{ width: '18rem' }}>
        <Card.Header>Header</Card.Header>
        <Card.Body>
          <Card.Title>Info Card Title</Card.Title>
          <Card.Text>
            Some quick example text to build on the card title and make up the
            bulk of the card's content.
          </Card.Text>
        </Card.Body>
      </Card>
      <br />
      </>
        );
      }
      
 

 
    
        
