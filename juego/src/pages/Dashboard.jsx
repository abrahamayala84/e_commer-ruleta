
import axios from 'axios'
import  { UserContext } from '../context/userContext'
import { useContext, useEffect } from 'react'
import Card from 'react-bootstrap/Card'
import { useNavigate } from 'react-router-dom'


export const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem('user'))
    console.log(user)
 const {userContex, tokenContext, setUserContext} = useContext(UserContext)
 console.log(userContex, tokenContext,setUserContext)
 const navigate = useNavigate()


useEffect(() => {
  if(!user){
    console.log("hola")
    navigate('/')
  }

},[])


    return(
      
        <div className="container-card" >
          <header><h1>WELCOME</h1><h2>{user.name}</h2></header>
       <div className="container">      
   <Card> 
      <Card.Body>
        <Card.Title>Selecionar</Card.Title>
        <Card.Subtitle className="mb-2 text-muted">Card Subtitle</Card.Subtitle>
        <Card.Text>
          Some quick example text to build on the card title and make up the
          bulk of the card's content.
        </Card.Text>
        <Card.Link href="agregar">agregar</Card.Link>
        <Card.Link href="ruleta">jugar</Card.Link>
      </Card.Body>
    </Card>

    </div> 
    
        </div>
    )
}