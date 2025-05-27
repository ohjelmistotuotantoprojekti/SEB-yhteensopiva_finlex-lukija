import axios from 'axios'
import { useState } from 'react'
import SearchForm from './SearchForm'
import LawList from './LawList'
import type {Law, Lang} from '../types'
import LanguageSelection from './LanguageSelection'


const ListPage = ({language, setLanguage} : Lang) => {
   
  // Tallentaa hakukentän (komponentilta SearchForm) tilan.
  const [search, setSearch] = useState<string>('')
  const [laws, setLaws] = useState<Law[]>([])

  const topStyle = {
    display: 'flex',
    justifyContent: 'flex-end',
    alignContent: 'center',
    width: '100%',
    height: '50px',
    backgroundColor: '#0C6FC0',
    padding: '2px',
  }

  const contentStyle = {
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
    padding: '5px',
  }

  const contentContainerStyle = {
    width: '700px',
    border: '0px solid black',
  }

  // Hakee backendiltä dataa
  const getJson = async (path: string) => {
    const response = await axios.get(path)
    setLaws(response.data)
  }
  
  // Käsittelee SearchForm-komponentin submit-aktionia.
  // Jos haussa on "/", haetaan yksittäistä lakia, jos se on vuosiluku, haetaan vuodella, muutoin haetaan hakusanalla.
  const handleSearchEvent = async (event: React.SyntheticEvent) => {
    event.preventDefault()

    if (search.includes("/")) {
      const law_number = search.split("/")[0]
      const year = search.split("/")[1]
      const response = await axios.get(`/api/statute/id/${year}/${law_number}/${language}`)
      if (response.data !== "<AknXmlList><Results/></AknXmlList>") {
        window.location.href = `/lainsaadanto/${year}/${law_number}`
      } else {
        console.log("Ei löydy mitään")
      }
    }
    else if (search.match(/\b(18\d{2}|19\d{2}|20\d{2}|2100)\b/)) {
      getJson(`/api/statute/year/${search}/${language}`) 
    } 
    else {
      getJson(`/api/statute/keyword/${search}/${language}`)
    }


  }

  // Tallentaa SearchForm-komponentin hakukentän tilan (tekstin).
  const handleSearchInputChange = (event: React.SyntheticEvent) => {
    setSearch((event.target as HTMLInputElement).value)
  }
  
  return (
    <div id="lawpagediv">
      <div style={topStyle} id="topdiv">
    <LanguageSelection language={language} setLanguage={setLanguage}/>
    </div>
    <div style={contentStyle} id="contentdiv">
      <div id="ccDiv" style={contentContainerStyle}>
    <h3>{language==="fin" ? "Lainsäädäntö:" : "Lagstiftning"}</h3>
    <SearchForm search={search}
                language={language}  
                handleSearchInputChange={handleSearchInputChange}
                handleSearchEvent={handleSearchEvent} 
    />
    <LawList laws={laws} />
    </div>
    </div>
    </div>
  )
}

export default ListPage