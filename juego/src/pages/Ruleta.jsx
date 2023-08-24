
import { useEffect, useState,  } from "react"
import {getPremios, userServices} from "../services/userServices"
import Table from 'react-bootstrap/Table';


export const Ruleta = (() => {
  
    const [ganador, setGanador] = useState(0)
    const[girar, setgirar] = useState ('detener')
    const [premios, setPremios] = useState(["","","","","","","","","","","",""])
    

    const savedUsert = () => {
      localStorage.setItem('premioss', JSON.stringify(premios))
      return console.log(JSON.parse(localStorage.getItem(premios))) 
   }
    const user = JSON.parse(localStorage.getItem('user'))
    const premio = JSON.parse(localStorage.getItem('premioss'))
    


    useEffect(() => {
   getPremios().then((premios) => {console.log(premios)
   setPremios(premios.premioss[0].premios[0]._input)})
  
   
   
    },[])
 console.log(premios)
 console.log(ganador)
 

 
   function boton () {
      
      setgirar('rodar')
      setTimeout(() => { 
         setgirar('detener')
         setGanador( Math.floor(Math.random() *12));
      }, 3000);
   }

   function handleValue (e){
      let  _premios = [...premios]

    _premios[parseInt(e.target.id)-1]= e.target.value 
    
     
   }
   console.log()
    return (
        <div >
          <header>
             <h1>Bienvenido y mucha surte!!</h1>
             <h2>{user.name}</h2>
             <h1>Premio</h1>
             <h2>numero en ruleta</h2>
             <h2>{ganador}</h2>
             <h2>{premios[ganador]}</h2>
          </header>
          <br />
            
          <ul  id="ruleta" className={girar}>
            <li id={1}>
               <div className="texto" contentEditable= 'true' spellCheck="false" suppressContentEditableWarning={true}>1</div>
            </li>
            <li id={2}>
               <div className="texto" contentEditable= 'true' spellCheck="false" suppressContentEditableWarning={true}>2</div>
            </li>
            <li id={3}>
               <div className="texto" contentEditable= 'true' spellCheck="false" suppressContentEditableWarning={true}>{premios[2]}</div>
            </li>
            <li id={4}>
               <div className="texto" contentEditable= 'true' spellCheck="false" suppressContentEditableWarning={true}>4</div>
            </li>
            <li id={5}>
               <div className="texto" contentEditable= 'true' spellCheck="false" suppressContentEditableWarning={true}>5</div>
            </li>
            <li id={6}>
               <div className="texto" contentEditable= 'true' spellCheck="false" suppressContentEditableWarning={true}>6</div>
            </li>
            <li id={7}>
               <div className="texto" contentEditable= 'true' spellCheck="false" suppressContentEditableWarning={true}>7</div>
            </li>
            <li id={8}>
               <div className="texto" contentEditable= 'true' spellCheck="false" suppressContentEditableWarning={true}>8</div>
            </li>
            <li id={9}>
               <div className="texto" contentEditable= 'true' spellCheck="false" suppressContentEditableWarning={true}>9</div>
            </li>
            <li id={10}>
               <div className="texto" contentEditable= 'true' spellCheck="false" suppressContentEditableWarning={true}>10</div>
            </li>
            <li id={11}>
               <div className="texto" contentEditable= 'true' spellCheck="false" suppressContentEditableWarning={true}>11</div>
            </li>
            <li id={12}>
               <div className="texto" contentEditable= 'true' spellCheck="false" suppressContentEditableWarning={true}>12</div>
            </li>
        </ul>

        <button onClick={boton}  className="RL">girar</button>
        <div >
         <h1>Felicidades ganaste :</h1>
         <h2>{premios[ganador]}</h2>
         </div>

        <Table  striped bordered hover size="sm">
      <thead>
        <tr>
          <th>#</th>
          <th> negocio</th>
          <th>premio y promociones</th>
          
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>1 y 2</td>
          <td>{premios[0]}</td>
          <td>{premios[1]}</td>
        </tr>
        <tr>
        <td>3 y 4</td>
          <td>{premios[2]}</td>
          <td>{premios[3]}</td>
        </tr>
        <tr>
         <td>5 y 6</td>
          <td>{premios[4]}</td>
          <td >{premios[5]}</td>
        </tr>
        <tr>
          <td>7 y 8</td>
          <td>{premios[6]}</td>
          <td>{premios[7]}</td>
        </tr>
        <tr>
          <td>9 y 10</td>
          <td>{premios[8]}</td>
          <td>{premios[9]}</td>
        </tr>
        <tr>
          <td>11 y 12</td>
          <td>{premios[10]}</td>
          <td>{premios[11]}</td>
        </tr>
      </tbody>
    </Table>

    <ul>
      <li>hola
         {user.nombre}
      </li>
      <li>hol</li>
    </ul>
        </div>
        
        
)
}



) 