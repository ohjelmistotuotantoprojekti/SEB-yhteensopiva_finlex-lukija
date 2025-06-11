import { 
        BrowserRouter as Router,
        Routes, Route,
 } from 'react-router-dom'   
import ListDocumentPage from './components/ListDocumentPage'
import DocumentPage from './components/DocumentPage'
import { useState } from 'react'
import { Helmet } from "react-helmet";


const App = () => {
  const [language, setLanguage] = useState<string>(() => {
    return localStorage.getItem("language") || "fin"
  })

  const backtext: string = language==="fin" ? "Takaisin" : "Tillbaka"
  const buttontext: string = language==="fin" ? "Hae" : "Sök"
 
  if (window.location.pathname === "/") {
    window.location.href = "/lainsaadanto/"
  }

  return (
    <Router>
    <div>

    <Helmet>
        <title>Finlex Lite</title>
    </Helmet>
    <Routes>
      <Route key="listpage" path="/lainsaadanto/" element={<ListDocumentPage language={language} setLanguage={setLanguage} buttonetext={buttontext} 
                        apisection="statute"
                        frontsection='lainsaadanto'
                        placeholdertext={language==="fin" ? "Vuosi tai numero/vuosi tai avainsana" : "År eller nummer/år eller nyckelord"}
                  />
                  } 
      />
      <Route key="lawpage" path="/lainsaadanto/:year/:id" 
          element={<DocumentPage language={language} backpath='/lainsaadanto/' 
                            backtext={backtext} apipath="statute" />
                  } 
      />
      <Route key="caselistpage" path="/oikeuskaytanto" 
        element={<ListDocumentPage language={language} setLanguage={setLanguage} buttonetext={buttontext} apisection="judgment"
                        frontsection='oikeuskaytanto'
                        placeholdertext={language==="fin" ? "Vuosi tai oikeusaste:vuosi:numero tai avainsana" : "År eller domstol:år:nummer eller nyckelord"}
                  />
                  } 
      />
      <Route key="caselawpage" path="/oikeuskaytanto/:year/:id/:level" 
          element={<DocumentPage language={language} backpath='/oikeuskaytanto/' 
                            backtext={backtext} apipath="judgment" />
                  } 
      />
    </Routes>
    </div>
    </Router>
  )
}

export default App
