import { Inicio } from './pages/Inicion';

import { Route, Routes,  } from 'react-router-dom';
import './App.css';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Inicio/>}/>
      </Routes>
    </div>
  );
}

export default App;
