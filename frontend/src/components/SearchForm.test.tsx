import { render, screen } from '@testing-library/react'
import SearchForm from './SearchForm'



test('renders content', () => {

    const search: string =  '' 
    const handleInput = (event: React.SyntheticEvent) => {
        return
    }
    const handleSubmit = (event: React.SyntheticEvent) => {
        return
    }
   
    // tests that the search input field is rendered.
    render(<SearchForm search={search} handleSearchInputChange={handleInput} handleSearchEvent={handleSubmit} />)
    const element = screen.getByPlaceholderText('Search year')
    expect(element).toBeDefined()
    


})