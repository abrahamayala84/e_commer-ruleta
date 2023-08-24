import { Inicio } from './pages/Inicion';
import { Crear } from './pages/Sing_in';
import { Ruleta } from './pages/Ruleta';
import { Agregar } from './pages/Agregar';
import { Route, Routes,  } from 'react-router-dom';
import './App.css';
import { Dashboard } from './pages/Dashboard';


function App() {

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Inicio/>}/>
        <Route path="/agregar" element={<Agregar/>}/>
        <Route path="/ruleta" element={<Ruleta/>}/>
        <Route path="/crear" element={<Crear/>}/>
        <Route path="/dashboard" element={<Dashboard/>}
        />
      </Routes>
    </div>
  );
}

export default App;
