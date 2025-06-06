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
  console.log("default laws", defaultLaws)
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

  function logError(error: unknown, msg: string) {
    console.error("Error:", error);
    localStorage.removeItem("hakucontent")
    setLaws([])
    setErrorMessage(msg)
    showError(msg)
  }
  
  // Käsittelee SearchForm-komponentin submit-aktionia.
  const handleSearchEvent = async (event: React.SyntheticEvent) => {
    event.preventDefault()

    // lisää haku localStorageen
    localStorage.setItem("haku", search)

    try {
      const response = await axios.get(`/api/statute/search`,
        { params: { q: search, language: language } }
      )
      if (response.data.type === "resultList") {
        localStorage.setItem("hakucontent", JSON.stringify(response.data.content))
        setLaws(response.data.content)
      } else if (response.data.type === "redirect") {
        const { number, year } = response.data.content
        window.location.href = `/lainsaadanto/${year}/${number}`
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        // Axios virhe, joka sisältää vastauksen
        console.error("Axios error:", error.response.data);
        if (error.response.status === 404) {
          // Ei löytynyt tuloksia
          logError(error, language === "fin" ? "Haulla ei löytynyt hakutuloksia" : "Inga sökresultat")
        } else if (error.response.status === 400) {
          // Virheellinen pyyntö, esim. väärä kieli tai puuttuva kysely
          logError(error, language === "fin" ? "Virheellinen haku" : "Ogiltig sökning")
        } else {
          logError(error, language === "fin" ? "Odottamaton virhe, yritä myöhemmin uudestaan" : "Okänt fel, försök igen senare")
        }
      } else {
        // Muu virhe, esim verkko-ongelma
        logError(error, language === "fin" ? "Odottamaton virhe, yritä myöhemmin uudestaan" : "Okänt fel, försök igen senare")
      }
      
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