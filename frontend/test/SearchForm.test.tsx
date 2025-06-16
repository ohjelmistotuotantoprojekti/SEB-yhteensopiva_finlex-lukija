import { fireEvent, render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import SearchForm from '../src/components/SearchForm'
import userEvent from '@testing-library/user-event'

const buttonetext = "Hae"
const placeholdertext = "Vuosi tai numero/vuosi"

test('renders content', () => {

    const search: string =  '' 
    const handleInput = () => {
        return
    }
    const handleSubmit = () => {
        return
    }
   
    // Testaa että hakukenttä renderöidään.
    render(<SearchForm 
                search={search}
                buttontext={buttonetext}  
                placeholdertext={placeholdertext}
                handleSearchInputChange={handleInput}
                handleSearchEvent={handleSubmit} 
            />)
    const element = screen.getByPlaceholderText(placeholdertext)
    expect(element).toBeDefined()
    
})

test('call handleInput', () => {

    const search: string =  '' 
    const handleInput = vi.fn()
    const handleSubmit = vi.fn()

    
    render(<SearchForm 
                search={search}
                buttontext={buttonetext}  
                placeholdertext={placeholdertext}
                handleSearchInputChange={handleInput}
                handleSearchEvent={handleSubmit} 
            />)
    const searchInput = screen.getByPlaceholderText(placeholdertext)
   
    // Testaa hakukentän toimintaa.
    fireEvent.change(searchInput, { target: {value: "Test"}})
    expect(handleInput).toHaveBeenCalled()
    
})

test('call handleInput', async () => {
    const user = userEvent.setup()
    const handleInput = vi.fn()
    const handleSubmit = vi.fn()

    const search: string = '' 

    render(<SearchForm 
                search={search}
                buttontext={buttonetext}  
                placeholdertext={placeholdertext}
                handleSearchInputChange={handleInput}
                handleSearchEvent={handleSubmit} 
            />)
    const searchInput = screen.getByPlaceholderText(placeholdertext)
    const button = screen.getByText(buttonetext)
   
    // Testaa että hakukentän toimintaa.
    await user.type(searchInput, "Testi")
    await user.click(button)
    console.log(handleSubmit.mock.calls[0][0].target)
    
})