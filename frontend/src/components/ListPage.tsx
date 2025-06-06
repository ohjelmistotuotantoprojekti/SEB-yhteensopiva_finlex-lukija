import axios from 'axios'
import { useState } from 'react'
import SearchForm from './SearchForm'
import LawList from './LawList'
import Notification  from './Notification'
import type {Law, Lang} from '../types'
import LanguageSelection from './LanguageSelection'


const ListPage = ({language, setLanguage} : Lang) => {

  // Tallentaa hakukentän (komponentilta SearchForm) tilan.
  const defaultSearch = localStorage.getItem("haku") || ""
  let defaultLaws: Law[] = [];
  try {
    const storedData = localStorage.getItem("hakucontent");
    defaultLaws = storedData ? JSON.parse(storedData) : [];
  } catch (error) {
    console.error("Failed to parse hakucontent from localStorage:", error);
    defaultLaws = [];
  }
  const [search, setSearch] = useState<string>(defaultSearch)
  const [laws, setLaws] = useState<Law[]>(defaultLaws)
  const [errorMessage, setErrorMessage] = useState<string>("")

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

  const errorStyle = {
    width: '640px',
    font: 'arial',
    backgroundColor: 'rgb(243, 248, 252)',
    border: 'solid #0C6FC0',
  }

  // Hakee backendiltä dataa
  const msg = language === "fin" ? "Haulla ei löytynyt hakutuloksia" : "Inga sökresultat"
  const getJson = async (path: string) => {
    try {
        const response = await axios.get(path)
        if (response.data.length === 0) {
          localStorage.removeItem("hakucontent")
          setLaws([])
          setErrorMessage(msg)
          showError(msg)
        } else {
          localStorage.setItem("hakucontent", JSON.stringify(response.data))
          setLaws(response.data)
        }
    } catch (error) {
      console.log("error1" + error)
      localStorage.removeItem("hakucontent")
      setLaws([])
      setErrorMessage(msg)
      showError(msg)
    }
  }
  
  // Käsittelee SearchForm-komponentin submit-aktionia.
  // Jos haussa on "/", haetaan yksittäistä lakia, jos se on vuosiluku, haetaan vuodella, muutoin haetaan hakusanalla.
  const handleSearchEvent = async (event: React.SyntheticEvent) => {
    event.preventDefault()

    // lisää haku localStorageen
    localStorage.setItem("haku", search)

    if (search === "") {
      localStorage.removeItem("hakucontent")
      setLaws([])
      setErrorMessage(msg)
      showError(msg)
    }
    else if (search.includes("/")) {
      if (search.match(/[0-9]\d*\/\b(18\d{2}|19\d{2}|20\d{2}|2100)\b/)) {
        const law_number = search.split("/")[0]
        const year = search.split("/")[1]

        try {const response = await axios.get(`/api/statute/id/${year}/${law_number}/${language}`)
          if (response.data !== "<AknXmlList><Results/></AknXmlList>") {
            window.location.href = `/lainsaadanto/${year}/${law_number}`
          } else {
            setErrorMessage(msg)
            showError(msg)
        }} catch (error) {
          console.log("error2" + error)
          setErrorMessage(msg)
          showError(msg)
        }
      } else {
        setErrorMessage(msg)
        showError(msg)
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

  function showError(errorMessage: string) {
    setErrorMessage(
          errorMessage
        )
        setLaws([])
        setTimeout(() => {
          setErrorMessage("")
        }, 2500)
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
    <div style={errorStyle}>
      <Notification message={errorMessage} />
    </div>
    <LawList laws={laws} />
    </div>
    </div>
    </div>
  )
}

export default ListPage