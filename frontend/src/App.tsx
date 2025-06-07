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
 

  return (
    <Router>
    <div>

    <Helmet>
        <title>Finlex Lite</title>
    </Helmet>
    <Routes>
      <Route key="listpage" path="/" element={<ListDocumentPage language={language} setLanguage={setLanguage} buttonetext={buttontext} 
                        apisection="statute"
                        frontsection='lainsaadanto' pagetitle={language==="fin" ? "Lainsäädäntö:" : "Lagstiftning"}
                        placeholdertext={language==="fin" ? "Vuosi tai numero/vuosi" : "År eller nummer/år"}
                  />
                  } 
      />
      <Route key="lawpage" path="/lainsaadanto/:year/:id" 
          element={<DocumentPage language={language} backpath='/' 
                            backtext={backtext} apipath="statute" />
                  } 
      />
      <Route key="caselistpage" path="/oikeuskaytantohaku" 
        element={<ListDocumentPage language={language} setLanguage={setLanguage} buttonetext={buttontext} apisection="judgment"
                        frontsection='oikeuskaytanto' pagetitle={language==="fin" ? "Oikeuskäytäntö" : "Rättspraxis"}
                        placeholdertext={language==="fin" ? "Vuosi tai numero/vuosi" : "År eller nummer/år"}
                  />
                  } 
      />
      <Route key="caselawpage" path="/oikeuskaytanto/:year/:id/:level" 
          element={<DocumentPage language={language} backpath='/oikeuskaytantohaku/' 
                            backtext={backtext} apipath="judgment" />
                  } 
      />
    </Routes>
    </div>
    </Router>
  )
}

export default App
