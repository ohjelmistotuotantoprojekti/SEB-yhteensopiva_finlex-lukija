import axios from 'axios'
import { useState } from 'react'
import SearchForm from './SearchForm'
import LawList from './LawList'
import type {Law} from '../types'


const ListPage = () => {
   
  // Tallentaa hakukentän (komponentilta SearchForm) tilan.
  const [search, setSearch] = useState<string>('')
  const [laws, setLaws] = useState<Law[]>([])

  // Hakee backendiltä dataa
  const getJson = async (path: string) => {
    const response = await axios.get(path)
    setLaws(response.data)
  }
  
  // Käsittelee SearchForm-komponentin submit-aktionia.
  const handleSearchEvent = async (event: React.SyntheticEvent) => {
    event.preventDefault()
    if (search.includes("/")) {
      const law_number = search.split("/")[0]
      const year = search.split("/")[1]
      const response = await axios.get(`/api/statute-consolidated/id/${year}/${law_number}`)
      if (response.data !== "<AknXmlList><Results/></AknXmlList>") {
        window.location.href = `/lainsaadanto/${year}/${law_number}`
      } else {
        console.log("Ei löydy mitään")
      }
    }
    else {
      getJson(`/api/statute-consolidated/year/${search}`)
    } 
  }

  // Tallentaa SearchForm-komponentin hakukentän tilan (tekstin).
  const handleSearchInputChange = (event: React.SyntheticEvent) => {
    setSearch((event.target as HTMLInputElement).value)
  }
  
  return (
    <div id="lawpagediv">
    <h3>Lakitekstit:</h3>
    <SearchForm search={search}  
                handleSearchInputChange={handleSearchInputChange}
                handleSearchEvent={handleSearchEvent} 
    />
    <LawList laws={laws} />
    </div>
  )
}

export default ListPage