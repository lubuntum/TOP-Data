
import { RegisterForm } from './features/auth/RegisterForm'

function App() {
  return (
    <div className="app-layout">
      <header className='app-header'>
        <h1 className='text-xl font-bold text-primary'>Профориентация академия ТОП</h1>
      </header>
      <main className='app-main flex justify-center items-center'>
        <RegisterForm/>
      </main>
    </div>
  )

}

export default App
