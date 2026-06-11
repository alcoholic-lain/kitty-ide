import { useRef, useState } from 'react'
import './SearchBar.css'

function SearchBar() {
    const inputRef = useRef(null)
    const [query, setQuery] = useState('')

    function handleFocus() {
        if (query.trim()) {
            window.electron.sendQuery(query)
            const bounds = inputRef.current.getBoundingClientRect()
            window.electron.showSearchResults({
                x: bounds.left,
                y: bounds.top,
                width: bounds.width,
                height: bounds.height
            })
        }
    }

    function handleBlur() {
        setTimeout(() => window.electron.hideSearchResults(), 150)
    }

    function handleChange(e) {
        const value = e.target.value
        setQuery(value)
        window.electron.sendQuery(value)
        if (value.trim()) {
            const bounds = inputRef.current.getBoundingClientRect()
            window.electron.showSearchResults({
                x: bounds.left,
                y: bounds.top,
                width: bounds.width,
                height: bounds.height
            })
        } else {
            window.electron.hideSearchResults()
        }
    }

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