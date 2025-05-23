import type {Props} from '../types'

const SearchForm = ({language, search, handleSearchInputChange, handleSearchEvent} : Props ) => {

  const searchStyle = {
    width: "500px",
    backgroundColor: "white",
    border: '1px solid #eeeeee',
    padding: '10px',
    margin: '4px',
  }

  return (
       <div key="searchdiv" style={searchStyle}>
        <form key="searchForm" onSubmit={handleSearchEvent}>
          <input type="text" key="searchField" 
         onChange={handleSearchInputChange}
          value={search}
          placeholder={language==="fin" ? "Vuosi tai numero/vuosi" : "År eller nummer/år"}
          />
          <button type="submit">{language==="fin" ? "Hae" : "Sök"}</button>
        </form>
      </div>
   )
}

export default SearchForm