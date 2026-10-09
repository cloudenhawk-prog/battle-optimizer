// Browser entry point: verifies static game data, then mounts <App /> inside the router.
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles/main.css'
import './styles/theme/tokens.css'
import './styles/theme/primitives.css'
import { verifyData, checkAssets } from './data/validation/verifyData'

// ========== Data Verification ================================================================================================

verifyData()
void checkAssets()

// ========== Root Main ========================================================================================================

ReactDOM.createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
)
