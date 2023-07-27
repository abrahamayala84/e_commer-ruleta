import { Inicio } from './pages/Inicion';
import { Crear } from './pages/Sing_in';


import { Route, Routes,  } from 'react-router-dom';
import './App.css';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Inicio/>}/>
        <Route path="/crear" element={<Crear/>}/>
      </Routes>
    </div>
  );
}

export default App;
