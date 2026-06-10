import { useState, useEffect, useCallback, useRef } from 'react'
import './SearchResults.css'

function SearchResults() {
    const [query, setQuery] = useState('')
    const [suggestions, setSuggestions] = useState([])
    const [visible, setVisible] = useState(true)
    const [selectedIndex, setSelectedIndex] = useState(-1)
    
    const suggestionsRef = useRef(suggestions)
    useEffect(() => {
        suggestionsRef.current = suggestions
    }, [suggestions])

    // Listen for keyboard events forwarded from main window
    useEffect(() => {
        const cleanups = []
        
        const unsubQuery = window.electron.onQuery(setQuery)
        cleanups.push(unsubQuery)
        
        const unsubSuggestions = window.electron.onSuggestions((s) => {
            setSuggestions(s)
            setSelectedIndex(-1)
        })
        cleanups.push(unsubSuggestions)
        
        const unsubVisibility = window.electron.onOverlayVisibility(setVisible)
        cleanups.push(unsubVisibility)
        
        // Listen for keyboard events from main window
        const unsubKeyboard = window.electron.onKeyboardEvent((key) => {
            if (!visible || suggestionsRef.current.length === 0) return
            
            if (key === 'ArrowDown') {
                setSelectedIndex(prev => {
                    const maxIndex = suggestionsRef.current.length - 1
                    return prev < maxIndex ? prev + 1 : 0
                })
            } else if (key === 'ArrowUp') {
                setSelectedIndex(prev => {
                    const maxIndex = suggestionsRef.current.length - 1
                    return prev > 0 ? prev - 1 : maxIndex
                })
            } else if (key === 'Enter') {
                if (selectedIndex >= 0 && suggestionsRef.current[selectedIndex]) {
                    window.electron.selectSuggestion(suggestionsRef.current[selectedIndex])
                }
            } else if (key === 'Escape') {
                window.electron.hideOverlay()
            }
        })
        cleanups.push(unsubKeyboard)
        
        return () => {
            cleanups.forEach(cleanup => cleanup && cleanup())
        }
    }, [visible, selectedIndex])

    function handleSelect(suggestion, index) {
        setSelectedIndex(index)
        window.electron.selectSuggestion(suggestion)
    }

    function handleMouseEnter(index) {
        setSelectedIndex(index)
    }

    if (!visible) return null

    return (
        <div className="search-overlay">
            <div className="search-results">
                {suggestions.length === 0 && query.trim() !== '' && (
                    <p className="search-results__empty">No results for "{query}"</p>
                )}
                {suggestions.length === 0 && query.trim() === '' && (
                    <p className="search-results__empty">Start typing...</p>
                )}
                {suggestions.map((s, i) => (
                    <div 
                        key={i} 
                        className={`search-results__item ${selectedIndex === i ? 'selected' : ''}`}
                        onClick={() => handleSelect(s, i)}
                        onMouseEnter={() => handleMouseEnter(i)}
                    >
                        {s}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default SearchResults