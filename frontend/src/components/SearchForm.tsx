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
       <div style={searchStyle}>
        <form id="searchForm" onSubmit={handleSearchEvent}>
          <input type="text" id="searchField" 
         onChange={handleSearchInputChange}
          value={search}
          placeholder="Search year / number"
          />
        </form>
      </div>
   )
}

export default SearchForm