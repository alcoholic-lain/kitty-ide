import './HeaderBar.css'
import { Minus, Square, X, Plus } from 'lucide-react'
import SearchBar from '../SearchBar/SearchBar'
import { useState, useEffect, useRef } from 'react'

function HeaderBar() {
    const [tabs, setTabs] = useState([])
    const [activeTabId, setActiveTabId] = useState(null)
    const initialized = useRef(false)

    useEffect(() => {
        // Only initialize once
        if (initialized.current) return
        initialized.current = true
        
        console.log('HeaderBar mounted')
        
        // Listen for tab events
        const unsubCreated = window.electron.onTabCreated(({ tabId, url }) => {
            console.log('Tab created event:', tabId)
            setTabs(prev => [...prev, { id: tabId, title: 'New Tab' }])
            setActiveTabId(tabId)
        })
        
        const unsubUpdated = window.electron.onTabUpdated(({ tabId, title }) => {
            console.log('Tab updated event:', tabId, title)
            setTabs(prev => prev.map(t => t.id === tabId ? { ...t, title } : t))
        })
        
        const unsubClosed = window.electron.onTabClosed(({ tabId }) => {
            console.log('Tab closed event:', tabId)
            setTabs(prev => {
                const newTabs = prev.filter(t => t.id !== tabId)
                if (newTabs.length === 0) {
                    setActiveTabId(null)
                }
                return newTabs
            })
        })

        // Create initial tab only once
        console.log('Creating initial tab...')
        window.electron.createTab('https://www.google.com')

        return () => {
            unsubCreated?.()
            unsubUpdated?.()
            unsubClosed?.()
        }
    }, [])

    const createTab = () => {
        console.log('Create tab button clicked')
        window.electron.createTab('https://www.google.com')
    }
    
    const closeTab = (id, e) => { 
        e.stopPropagation()
        console.log('Close tab clicked:', id)
        window.electron.closeTab(id) 
    }
    
    const switchTab = (id) => {
        console.log('Switch tab clicked:', id)
        window.electron.switchTab(id)
    }

    return (
        <header className="header-bar">
            <div className="header-bar__row">
                <div className="header-bar__logo" onDoubleClick={() => window.electron.toggleDevTools()}>
                    <img src="./kitty.png" alt="kitty ide" />
                </div>
                <div className="header-bar__tabs">
                    {tabs.map(tab => (
                        <div key={tab.id} className={`header-bar__tab ${activeTabId === tab.id ? 'active' : ''}`} onClick={() => switchTab(tab.id)}>
                            <span className="header-bar__tab-title">{tab.title || 'Loading...'}</span>
                            <button className="header-bar__tab-close" onClick={(e) => closeTab(tab.id, e)}><X size={12} /></button>
                        </div>
                    ))}
                    <button className="header-bar__new-tab" onClick={createTab}><Plus size={14} /></button>
                </div>
                <div className="header-bar__drag-area"></div>
                <div className="header-bar__right">
                    <button className="window-btn minimize" onClick={() => window.electron.minimize()}><Minus size={14} /></button>
                    <button className="window-btn maximize" onClick={() => window.electron.maximize()}><Square size={12} /></button>
                    <button className="window-btn close" onClick={() => window.electron.close()}><X size={14} /></button>
                </div>
            </div>
            <div className="header-bar__util"><SearchBar /></div>
        </header>
    )
}

export default HeaderBar