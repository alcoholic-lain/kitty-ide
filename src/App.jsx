import './App.css'
import HeaderBar from './components/HeaderBar/HeaderBar'
import BottomBar from './components/BottomBar/BottomBar'
import MainLayout from './layouts/MainLayout/MainLayout'

function App() {
  return (
    <div className="app">
      <HeaderBar />
      <MainLayout />
      <BottomBar />
    </div>
  )
}

export default App