import type {Props} from '../types'

const SearchForm = ({buttontext, placeholdertext, search, handleSearchInputChange, handleSearchEvent}: Props) => {


  const inputBoxStyle = {
    display: 'flex',
    justifyContent: 'center',
    width: '600px',
    padding: '20px',
    backgroundColor: ' #F3F8FC',
    border: '1px solid #0C6FC0',
    borderBottom: '4px solid #0C6FC0',
    marginTop: '70px',
    marginBottom: '50px',
  }

  const buttonStyle = {
    color: '#fafafa',
    backgroundColor:' #0C6FC0',
    fontSize: '15px'
  }

  const inputStyle = {
    border: '1px solid #0C6FC0',
    fontSize: '16px'
  }

  return (
       <div key="searchdiv" style={inputBoxStyle}>
        <form key="searchForm" onSubmit={handleSearchEvent}>
          <input type="text" size={55} key="searchField" 
         onChange={handleSearchInputChange}
          value={search}
          style={inputStyle}
          placeholder={placeholdertext}
          maxLength={60}/>
        &nbsp; <button style={buttonStyle} type="submit">{buttontext}</button>
        </form>
      </div>
   )
}

export default SearchForm