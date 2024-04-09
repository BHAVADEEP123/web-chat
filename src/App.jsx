import { useState } from 'react'
import './App.css'
import Room from './pages/Room'
import Login from './pages/login'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PrivateRoutes from './components/PrivateRoutes';
import { AuthProvider } from './utils/AuthContext';

function App() {
  const [count, setCount] = useState(0)

  return (
    // <>
    //   <Room/>
    //   <Login/>
    // </>
    <Router>
      <AuthProvider>
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route element={<PrivateRoutes />}>
          <Route path='/' element={<Room />} />
        </Route>
      </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
