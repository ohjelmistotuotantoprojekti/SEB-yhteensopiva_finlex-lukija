


import { 
        BrowserRouter as Router,
        Routes, Route, Link
 } from 'react-router-dom'   

import ListPage from './components/ListPage'
import LawPage from './components/LawPage'


const App = () => {

  const server: string = "http://localhost:3001"


  return (
    <Router>
    <div>
    <Routes>
      <Route key="listpage" path="/" element={<ListPage server={server} />} />
      <Route key="lawpage" path="/lainsaadanto/:year/:id" element={<LawPage server={server} />} />
    </Routes>
    </div>
    </Router>
  )
}

export default App
