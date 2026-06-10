import './MainLayout.css'
import Sidebar from '../../components/Sidebar/Sidebar'

function MainLayout() {
  return (
    <div className="main-layout">
      <Sidebar />
      <div className="main-layout__editor">
        <p >Kitty Ide :D</p>
      </div>
    </div>
  )
}

export default MainLayout