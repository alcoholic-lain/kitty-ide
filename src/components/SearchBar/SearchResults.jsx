import { useState, useEffect } from 'react'

function SearchResults({ standalone = false }) {
    const [suggestions, setSuggestions] = useState([])
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        if (standalone) {
            const unsubVisibility = window.electron.onSearchVisibility((v) => {
                setVisible(v)
            })
            const unsubSuggestions = window.electron.onSuggestions((s) => {
                setSuggestions(s)
            })
            return () => {
                unsubVisibility?.()
                unsubSuggestions?.()
            }
        }
    }, [standalone])

    if (!standalone || !visible || suggestions.length === 0) {
        return null
    }

    return (
        <div style={{
            backgroundColor: '#181825',
            border: '1px solid #211b25',
            borderRadius: '0 0 8px 8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            overflowY: 'auto',
            maxHeight: '400px'
        }}>
            {suggestions.map((s, i) => (
                <div
                    key={i}
                    style={{
                        padding: '8px 12px',
                        cursor: 'pointer',
                        borderBottom: '1px solid #211b25',
                        color: '#cdd6f4',
                        fontSize: '14px'
                    }}
                    onClick={() => {
                        window.electron.sendQuery(s)
                        window.electron.hideSearchResults()
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#89b4fa'
                        e.currentTarget.style.color = '#1e1e2e'
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#181825'
                        e.currentTarget.style.color = '#cdd6f4'
                    }}
                >
                    {s}
                </div>
            ))}
        </div>
    )
}

export default SearchResults