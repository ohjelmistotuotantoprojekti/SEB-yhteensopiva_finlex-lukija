import { render, screen } from '@testing-library/react'
import SearchForm from './SearchForm'


test('renders content', () => {

    const search: string =  '' 
    const handleInput = () => {
        return
    }
    const handleSubmit = () => {
        return
    }
   
    // tests that the search input field is rendered.
    render(<SearchForm search={search} handleSearchInputChange={handleInput} handleSearchEvent={handleSubmit} />)
    const element = screen.getByPlaceholderText('Vuosi tai numero/vuosi')
    expect(element).toBeDefined()
    
})