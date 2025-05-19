import { 
        BrowserRouter as Router,
        Routes, Route,
 } from 'react-router-dom'   
import ListPage from './components/ListPage'
import LawPage from './components/LawPage'


const App = () => {

  return (
    <Router>
    <div>
    <Routes>
      <Route key="listpage" path="/" element={<ListPage/>} />
      <Route key="lawpage" path="/lainsaadanto/:year/:id" element={<LawPage/>} />
    </Routes>
    </div>
    </Router>
  )
}

export default App
