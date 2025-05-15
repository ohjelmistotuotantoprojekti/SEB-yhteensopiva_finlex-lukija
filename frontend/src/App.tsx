import axios from 'axios'
import { useState } from 'react'
import SearchForm from './components/SearchForm'
import LawList from './components/LawList'
import type {Law, Props} from './types'


const App = () => {

  const server: string = "http://localhost:3001"

  const lawsDev: Law[] = [
    {
      docYear: "2024",
      docNumber: "244",
      docTitle: "law about averages",
    },
    {
      docYear: "2024",
      docNumber: "245",
      docTitle: "law about bananas",
    },
    {
      docYear: "2025",
      docNumber: "246",
      docTitle: "law about something",
    },
   
  ]

  // Tallentaa hakukentän (komponentilta SearchForm) tilan.
  const [search, setSearch] = useState<string>('')
  const [year, setYear] = useState<string>('')
  const [number, setNumber] = useState<string>('')
  const [laws, setLaws] = useState<Law[]>([])




  // Hakee backendiltä dataa
  const getJson = async (path: string) => {
    const url: string = `${server}${path}`
    console.log("url", url)
    await axios.get(url).then(response => {
        console.log(response.data)
    })
  }
  


  const updateYearNumber = () => {
   //   console.log(search)
      const query: string[] = search.split("/")
    
      if (query.length == 0) {
        return 
      }
      else if (query.length == 1) {
        setYear(query[0])
      }
      else if( query.length == 2) {
        setYear(query[0])
        setNumber(query[1])
      }
     
  }

  // Käsittelee SearchForm-komponentin submit-aktionia.
  const handleSearchEvent = (event: React.SyntheticEvent) => {
    event.preventDefault()
    updateYearNumber()
   
    getJson(`/api/statute-consolidated/year/:${year}`)
   
  
  }

  // Tallentaa SearchForm-komponentin hakukentän tilan (tekstin).
  const handleSearchInputChange = (event: React.SyntheticEvent) => {
    setSearch(event.target.value)
  }


  // Suodattaa laws-listaa vuoden ja numeron perusteella.
  const searchLaws = () => {
    
    console.log("searchig law. Year", year, "number", number)
    if(year === "") {
      return laws
    }
    if (year != "") {
      if (number != "") {
        return laws.filter((law) => {
              if (law.docYear === year && law.docNumber === number) {
                return true
              }
              return false
              
        })
      }
          else {
            return laws.filter((law)=> {
               if (law.docYear === year) {
                return true
               }
              return false
            })
          
          }
    }

  }

  return (
    <div>
    <h3>Lakitekstit:</h3>
    
   
    <SearchForm search={search}  
                handleSearchInputChange={handleSearchInputChange}
                handleSearchEvent={handleSearchEvent} 
    />

    <LawList laws={laws} />
    </div>
  )
}

export default App
