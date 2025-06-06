import { 
        BrowserRouter as Router,
        Routes, Route,
 } from 'react-router-dom'   
import ListPage from './components/ListPage'
import LawPage from './components/LawPage'
import ListCaseLawPage from './components/ListCaseLawPage'
import CaseLawPage from './components/CaseLawPage'
import { useState } from 'react'
import { Helmet } from "react-helmet";


const App = () => {
  const [language, setLanguage] = useState<string>(() => {
    return localStorage.getItem("language") || "fin"
  })

  return (
    <Router>
    <div>

    <Helmet>
        <title>Finlex Lite</title>
    </Helmet>
    <Routes>
      <Route key="listpage" path="/" element={<ListPage language={language} setLanguage={setLanguage}/>} />
      <Route key="lawpage" path="/lainsaadanto/:year/:id" element={<LawPage language={language} setLanguage={setLanguage}/>} />
      <Route key="caselistpage" path="/oikeuskaytantohaku" element={<ListCaseLawPage language={language} setLanguage={setLanguage}/>} />
      <Route key="caselawpage" path="/oikeuskaytanto/:year/:id/:level" element={<CaseLawPage language={language} setLanguage={setLanguage}/>} />
    </Routes>
    </div>
    </Router>
  )
}

export default App
