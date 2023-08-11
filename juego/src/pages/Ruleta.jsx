
import { useEffect, useState,  } from "react"
import {getPremios, userServices} from "../services/userServices"
import Table from 'react-bootstrap/Table';


export const Ruleta = (() => {
  
    const [ganador, setGanador] = useState(0)
    const[girar, setgirar] = useState ('detener')
    const [premios, setPremios] = useState(["","","","","","","","","","","",""])
    

    useEffect(() => {
   getPremios()
   
    },[])
 
    const savedUsert = () => {
      localStorage.setItem('premioss', JSON.stringify(premios))
      return console.log(JSON.parse(localStorage.getItem(premios))) 
   }
    const user = JSON.parse(localStorage.getItem('user'))
    const premio = JSON.parse(localStorage.getItem('premioss'))
    console.log(premio)

 
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
     setPremios(_premios)
     
   }
   console.log(premios[ganador])
    return (

        <div >
               <header><h1>WELCOME</h1><h2>{user.name}</h2><h1>{premios[ganador]}</h1></header><br />
            <div className="arrow"><h1>{premios[ganador]}</h1></div>
          <ul  id="ruleta" className={girar}>
            <li id={1}>
               <div className="texto" contentEditable= 'true' spellCheck="false" suppressContentEditableWarning={true}>1</div>
            </li>
            <li id={2}>
               <div className="texto" contentEditable= 'true' spellCheck="false" suppressContentEditableWarning={true}>2</div>
            </li>
            <li id={3}>
               <div className="texto" contentEditable= 'true' spellCheck="false" suppressContentEditableWarning={true}>3</div>
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
        <div className="tabla">
        <table>
         <tbody>
<tr><td><input id="1" onChange={handleValue} value={`${premios[0]}`} type="text" /></td></tr>
<tr><td><input id="2" onChange={handleValue} value={premios[1]} type="text" /></td></tr>
<tr><td><input id="3" onChange={handleValue} value={premios[2]} type="text" /></td></tr>
<tr><td><input id="4" onChange={handleValue} value={premios[3]} type="text" /></td></tr>
<tr><td><input id="5" onChange={handleValue} value={premios[4]} type="text" /></td></tr>
<tr><td><input id="6" onChange={handleValue} value={premios[5]} type="text" /></td></tr>
<tr><td><input id="7" onChange={handleValue} value={premios[6]} type="text" /></td></tr>
<tr><td><input id="8" onChange={handleValue} value={premios[7]} type="text" /></td></tr>
<tr><td><input id="9" onChange={handleValue} value={premios[8]} type="text" /></td></tr>
<tr><td><input id="10" onChange={handleValue} value={premios[9]} type="text" /></td></tr>
<tr><td><input id="11" onChange={handleValue} value={premios[10]} type="text" /></td></tr>
<tr><td><input id="12" onChange={handleValue} value={premios[11]} type="text" /></td></tr>

</tbody>
</table>
        </div>
        <img className="imagenes"  />
        <button onClick={boton}  className="RL">girar</button>
        <div ><h1>{premios[ganador]}</h1></div>

        <Table striped bordered hover size="sm">
      <thead>
        <tr>
          <th>#</th>
          <th> negocio</th>
          <th>premio y promociones</th>
          
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>1</td>
          <td>{}</td>
          <td>{premios[0]}</td>
        </tr>
        <tr>
        <td></td>
          <td></td>
          <td>{premios[1]}</td>
        </tr>
        <tr>
          <td></td>
          <td ></td>
          <td>{premios[2]}</td>
        </tr>
        <tr>
          <td>4</td>
          <td></td>
          <td>{}</td>
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