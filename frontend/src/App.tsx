import { 
        BrowserRouter as Router,
        Routes, Route,
 } from 'react-router-dom'   
import ListPage from './components/ListPage'
import LawPage from './components/LawPage'


const App = () => {

  let port: string =  ''
  let url: string =  ''
  let server: string = ''

  if (import.meta.env.DEV) {
    port = '3001'
    url = 'http://localhost'
  }
  
  if (url != "") {
    server = `${url}:${port}` 
  }

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
