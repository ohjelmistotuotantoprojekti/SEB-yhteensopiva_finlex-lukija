import type {Props} from '../types'

const SearchForm = ({search, handleSearchInputChange, handleSearchEvent} : Props ) => {

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
          placeholder="Search year"
          />
          <button type="submit">Hae</button>
        </form>
      </div>
   )
}

export default SearchForm