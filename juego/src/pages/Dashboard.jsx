
import userContext, { UserContext } from '../context/userContext'
import { useContext, useEffect } from 'react'
import Card from 'react-bootstrap/Card'

export const Dashboard = () => {
 const {userContex, tokenContext, setUserContext} = useContext(UserContext)
 console.log(userContex, tokenContext,setUserContext)

    return(
      
        <div className="container-card" >
          <header><h1>WELCOME</h1><h2>{userContex.name}</h2></header>
       <div className="container">      
   <Card> 
      <Card.Body>
        <Card.Title>Selecionar</Card.Title>
        <Card.Subtitle className="mb-2 text-muted">Card Subtitle</Card.Subtitle>
        <Card.Text>
          Some quick example text to build on the card title and make up the
          bulk of the card's content.
        </Card.Text>
        <Card.Link href="#">agregar</Card.Link>
        <Card.Link href="ruleta">jugar</Card.Link>
      </Card.Body>
    </Card>

    </div> 
        </div>
    )
}