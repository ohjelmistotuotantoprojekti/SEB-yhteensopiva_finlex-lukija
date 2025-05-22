import { fireEvent, render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import SearchForm from './SearchForm'


test('renders content', () => {

    const search: string =  '' 
    const handleInput = () => {
        return
    }
    const handleSubmit = () => {
        return
    }
   
    // Testaa että hakukenttä renderöidään.
    render(<SearchForm search={search} handleSearchInputChange={handleInput} handleSearchEvent={handleSubmit} />)
    const element = screen.getByPlaceholderText('Vuosi tai numero/vuosi')
    expect(element).toBeDefined()
    
})

test('call handleInput', () => {

    const search: string =  '' 
    const handleInput = vi.fn()
    const handleSubmit = vi.fn()

    render(<SearchForm search={search} handleSearchInputChange={handleInput} handleSearchEvent={handleSubmit} />)
    const searchInput = screen.getByPlaceholderText('Vuosi tai numero/vuosi')
   
    // Testaa että hakukentän toimintaa.
    fireEvent.change(searchInput, { target: {value: "Test"}})
    expect(handleInput).toHaveBeenCalled()
    
})
