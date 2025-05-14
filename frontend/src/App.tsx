interface Law {
  docYear:  string,
  docNumber: number,
  docTitle: string
}

interface Props {
  search: string,
  handleSearchInputChange: (event: React.SyntheticEvent) => void,
  handleSearchEvent: (event: React.SyntheticEvent) => void

}


import axios from 'axios'
import { useState } from 'react'



const SearchForm = ({search, handleSearchInputChange, handleSearchEvent} : Props ) => {

  return (
       <div>
        <form id="searchForm" onSubmit={handleSearchEvent}>
          <input type="text" id="searchField" 
         onChange={handleSearchInputChange}
          value={search}
          placeholder="Search"
          />
        </form>
      </div>
   )
}



const LawList = ({laws}: {laws: Law[]}) => {

  const listStyle = {
    width: "500px",
    backgroundColor: "#eeeeee",
    padding: '10px',
    margin: '4px',
  }

  return (
    <>
   
    { laws.map((law) =><div style={listStyle} key={law.docNumber}>{law.docYear}/{law.docNumber} {law.docTitle}</div>) }
  
    </>
  )

}


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


  const handleSearchEvent = (event: React.SyntheticEvent) => {
    event.preventDefault()
    console.log(search)
  
  }
  const handleSearchInputChange = (event: React.SyntheticEvent) => {
    setSearch(event.target.value)
  }


  /**  Hakee backendiltä dataa
  const getJson = async () => {
    const url: string = 'http://localhost:3001/notes'
    await axios.get(url).then(response => {
        console.log(response.data)
    })
  }
  */




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
