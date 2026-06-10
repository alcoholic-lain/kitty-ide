import './HeaderBar.css'
import { Minus, Square, X } from 'lucide-react'
import SearchBar from '../SearchBar/SearchBar'

function HeaderBar() {
  return (
    <header className="header-bar">

      <div className="header-bar__drag" />

      <div className="header-bar__row">
        <div className="header-bar__logo" onDoubleClick={() => window.electron.toggleDevTools()}>
          <img src="./kitty.png" alt="kitty ide" />
        </div>
        <div className="header-bar__left"></div>
        <div className="header-bar__center"></div>
        <div className="header-bar__right">
          <button className="window-btn minimize" onClick={() => window.electron.minimize()}>
            <Minus size={14} strokeWidth={7.5} />
          </button>
          <button className="window-btn maximize" onClick={() => window.electron.maximize()}>
            <Square size={12} strokeWidth={7.5} />
          </button>
          <button className="window-btn close" onClick={() => window.electron.close()}>
            <X size={14} strokeWidth={7.5} />
          </button>
        </div>
      </div>

      <div className="header-bar__util">
        <SearchBar />
      </div>

    </header>
  )
}

export default HeaderBar