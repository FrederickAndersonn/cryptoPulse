import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import CoinsPage from './pages/CoinsPage';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/coins" element={<CoinsPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
