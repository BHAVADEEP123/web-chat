import { useState } from 'react'
import './App.css'
import Room from './pages/Room'
import Login from './pages/login'
import { BrowserRouter as Router, Route, Routes} from 'react-router-dom';

function App() {
  const [count, setCount] = useState(0)

  return (
    // <>
    //   <Room/>
    //   <Login/>
    // </>
    <Router>
      <Routes>
        <Route path='/' element={<Room/>}/>
        <Route path='/login' element={<Login/>}/>
      </Routes>
    </Router>
  )
}

export default App
