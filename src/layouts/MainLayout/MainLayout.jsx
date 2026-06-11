import './MainLayout.css'
import Sidebar from '../../components/Sidebar/Sidebar'
import WebViewContainer from '../../components/WebViewContainer/WebViewContainer'

function MainLayout() {
    return (
        <div className="main-layout">
            <Sidebar />
            <div className="main-layout__editor">
                <WebViewContainer />
            </div>
        </div>
    )
}

export default MainLayout