import { Inicio } from './pages/Inicion';
import { Crear } from './pages/Sing_in';
import { Ruleta } from './pages/Ruleta';
import { Agregar } from './pages/Agregar';

import { Route, Routes,  } from 'react-router-dom';
import './App.css';
import { Dashboard } from './pages/Dashboard';
import { useEffect, useState, useContext } from 'react';
import { UserContext } from './context/userContext';


function App() {

  const [user, setUser] = useState(null)
  const [token, setToken] = useState('')
  const {tokenContext, setTokenContext,userContex, setUserContext} = useContext(UserContext)
 
useEffect(() => {console.log(user,token )},[user, token])
useEffect(() => {console.log(userContex )},[userContex])

  return (
    <div className="App">
      <Routes>
        {
         !user ?
          <Route path="/" element={<Inicio
            setToken={setToken}
            setUser={setUser}
            />}/> :
            <Route path="/" element={<Dashboard/>}/>
        }
        <Route path="/ruleta" element={<Ruleta/>}/>
        <Route path="/agregar" element={<Agregar/>}/>
        <Route path="/crear" element={<Crear/>}/>
        <Route path="/dashboard" element={<Dashboard/>}
        />
      </Routes>
    </div>
  );
}

export default App;
