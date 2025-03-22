import {useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {toast} from 'react-toastify'

const JoinRoom = () => {
  const [roomCode, setRoomCode] = useState('')
  const navigate = useNavigate()

  const handleJoinRoom = () => {
    if (roomCode.trim() === '') {
      toast.error('❌ Enter a valid Room Code.')
      return
    }
    localStorage.removeItem('roomCreator')
    navigate(`/room/${roomCode}`)
  }

  return (
    <div className='c flex-col gap-y-10 w-1/2 bg-white/10 backdrop-blur-lg !p-6 rounded-2xl'>
      <h2 className='mb-4 text-2xl font-semibold'>Join a Room</h2>
      <div className='c w-full max-w-md flex-col gap-y-10'>
        <input
          type='text'
          className='w-full rounded-md border border-white bg-black p-2 text-center outline-none focus:ring-2 focus:ring-white'
          value={roomCode}
          onChange={e => setRoomCode(e.target.value)}
          placeholder='Enter Room Code'
        />
        <button onClick={handleJoinRoom}>Join Room</button>
      </div>
    </div>
  )
}

export default JoinRoom
