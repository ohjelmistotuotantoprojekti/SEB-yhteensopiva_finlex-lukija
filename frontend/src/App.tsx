//import axios from 'axios'
import { useState } from 'react'
import SearchForm from './components/SearchForm'
import LawList from './components/LawList'
import type {Law} from './types'


const App = () => {

  const laws: Law[] = [
    {
      docYear: "2024",
      docNumber: 244,
      docTitle: "law about averages",
    },
    {
      docYear: "2024",
      docNumber: 245,
      docTitle: "law about bananas",
    },
    {
      docYear: "2024",
      docNumber: 246,
      docTitle: "law about something",
    },
   
  ]

  const [search, setSearch] = useState<string>('')


/**  Hakee backendiltä dataa
  const getJson = async () => {
    const url: string = 'http://localhost:3001/notes'
    await axios.get(url).then(response => {
        console.log(response.data)
    })
  }
  */

  const handleSearchEvent = (event: React.SyntheticEvent) => {
    event.preventDefault()
    console.log(search)
  
  }
  const handleSearchInputChange = (event: React.SyntheticEvent) => {
    setSearch(event.target.value)
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
