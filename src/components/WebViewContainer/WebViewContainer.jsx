import { useEffect, useRef, useState } from 'react'
import './WebViewContainer.css'

function WebViewContainer() {
    const containerRef = useRef(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const container = containerRef.current
        
        if (container) {
            const sendBounds = () => {
                const rect = container.getBoundingClientRect()
                console.log('Container bounds:', rect)
                // Send bounds to main process to position web view
                if (window.electron && window.electron.updateWebViewBounds) {
                    window.electron.updateWebViewBounds({
                        x: rect.x,
                        y: rect.y,
                        width: rect.width,
                        height: rect.height
                    })
                }
            }
            
            // Send initial bounds
            sendBounds()
            
            // Update bounds on resize
            const resizeObserver = new ResizeObserver(sendBounds)
            resizeObserver.observe(container)
            
            window.addEventListener('resize', sendBounds)
            
            // Listen for loading state
            if (window.electron && window.electron.onTabLoading) {
                const unsubLoading = window.electron.onTabLoading(({ isLoading: loading }) => {
                    setIsLoading(loading)
                })
                return () => {
                    resizeObserver.disconnect()
                    window.removeEventListener('resize', sendBounds)
                    unsubLoading?.()
                }
            }
            
            return () => {
                resizeObserver.disconnect()
                window.removeEventListener('resize', sendBounds)
            }
        }
    }, [])

    return (
        <div 
            ref={containerRef} 
            className="webview-container"
            id="webview-container"
        >
            {isLoading && (
                <div className="webview-container__placeholder">
                    <div className="webview-container__spinner"></div>
                    <div className="webview-container__text">Loading page...</div>
                </div>
            )}
        </div>
    )
}

export default WebViewContainer