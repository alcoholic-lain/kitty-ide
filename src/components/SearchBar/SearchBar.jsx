import { useRef, useState, useEffect } from 'react'
import './SearchBar.css'

function SearchBar() {
    const inputRef = useRef(null)
    const [query, setQuery] = useState('')

    function sendBounds() {
        const bounds = inputRef.current.getBoundingClientRect()
        window.electron.showOverlay({
            x: bounds.x,
            y: bounds.y,
            width: bounds.width,
            height: bounds.height,
        })
    }

    function handleFocus() {
        sendBounds()
    }

    function handleBlur() {
        setTimeout(() => window.electron.hideOverlay(), 150)
    }

    function handleChange(e) {
        const value = e.target.value
        setQuery(value)
        window.electron.sendQuery(value)
        if (value.trim()) sendBounds()
        else window.electron.hideOverlay()
    }

    // Update input when suggestion is selected
    useEffect(() => {
        window.electron.onSuggestionSelected((suggestion) => {
            setQuery(suggestion)
        })
    }, [])

    return (
        <div className="search-bar">
            <input
                ref={inputRef}
                type="text"
                placeholder="Search..."
                value={query}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onChange={handleChange}
            />
        </div>
    )
}

export default SearchBar