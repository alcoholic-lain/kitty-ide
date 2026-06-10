import { useRef } from 'react'
import './SearchBar.css'

function SearchBar() {
  const inputRef = useRef(null)

  function handleFocus() {
    const bounds = inputRef.current.getBoundingClientRect()
    window.electron.showOverlay({
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
    })
  }

function handleBlur() {
  window.electron.hideOverlay()
}

  return (
    <div className="search-bar">
      <input
        ref={inputRef}
        type="text"
        placeholder="Search..."
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
    </div>
  )
}

export default SearchBar