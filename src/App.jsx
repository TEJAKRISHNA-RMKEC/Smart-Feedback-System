import {BrowserRouter as Router, Routes, Route} from 'react-router-dom'
import Home from './pages/Home'
import CreateRoom from './pages/CreateRoom'
import JoinRoom from './pages/JoinRoom'
import Room from './pages/Room'
import Layout from './pages/Layout'
import {ToastContainer} from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const App = () => {
  return (
    <Router>
      <ToastContainer autoClose={3000} newestOnTop={true} theme='dark' />
      <Layout>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/create-room' element={<CreateRoom />} />
          <Route path='/join-room' element={<JoinRoom />} />
          <Route path='/room/:roomId' element={<Room />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
