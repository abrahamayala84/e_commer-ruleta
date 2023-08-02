
import { useState, useContext } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { Link } from 'react-router-dom';
import { Login } from '../services/userServices';
import { UserContext } from '../context/userContext';

export const Inicio = ({setToken, setUser}) => {
  const [email,setEmail] = useState('')
  const [password,setPassword] = useState('')
  const { setTokenContext, setUserContext} = useContext(UserContext)

  const submit = async (e) => {
    e.preventDefault()
    console.log('submit')

    if ( email !== '' && password !== '') {
     const data = await Login( email, password)
     console.log(data)
    if(!data){
      alert('error identificacion')
      }else{
      console.log(data.user);
      setUser(data.user)
      setToken(data.token)
      alert('success ident')
      setTokenContext(data.token)
      setUserContext(data.user);
     
    }}}


 return(
    <div className="container">
        <header ><h1>RULETA</h1></header>
        <div className="form">
        <Form>
      <Form.Group className="mb-3" controlId="formBasicEmail">
        <Form.Label>Email address</Form.Label>
        <Form.Control value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Enter email" /> 
      </Form.Group>

      <Form.Group className="mb-3" controlId="formBasicPassword">
        <Form.Label>Password</Form.Label>
        <Form.Control value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" autoComplete="on" />
      </Form.Group>
    
      <Button onClick={submit} variant="primary" type="submit">
        Submit
      </Button>
    </Form>
    </div>
    <br></br>
    <Link to="/crear"><h3 id="title">crear cuenta</h3></Link>
    
    </div>
 )

}