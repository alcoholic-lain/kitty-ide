import { X } from 'lucide-react'
import './Tab.css'

function Tab({ id, title, isActive, isLoading, onSelect, onClose }) {
    return (
        <div 
            className={`tab ${isActive ? 'active' : ''} ${isLoading ? 'loading' : ''}`}
            onClick={() => onSelect(id)}
        >
            {isLoading && (
                <div className="tab__loader">
                    <div className="tab__loader-spinner"></div>
                </div>
            )}
            <span className="tab__title">{title}</span>
            <button 
                className="tab__close"
                onClick={(e) => {
                    e.stopPropagation()
                    onClose(id)
                }}
            >
                <X size={12} />
            </button>
        </div>
    )
}

export default Tab