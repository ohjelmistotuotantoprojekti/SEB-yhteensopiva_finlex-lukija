import { fireEvent, render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import SearchForm from './SearchForm'
import userEvent from '@testing-library/user-event'


test('renders content', () => {

    const search: string =  '' 
    const handleInput = () => {
        return
    }
    const handleSubmit = () => {
        return
    }
    const language = "fin"
   
    // Testaa että hakukenttä renderöidään.
    render(<SearchForm language={language} search={search} handleSearchInputChange={handleInput} handleSearchEvent={handleSubmit} />)
    const element = screen.getByPlaceholderText('Vuosi tai numero/vuosi')
    expect(element).toBeDefined()
    
})

test('call handleInput', () => {

    const search: string =  '' 
    const handleInput = vi.fn()
    const handleSubmit = vi.fn()
    const language = "fin"
    
    render(<SearchForm language={language} search={search} handleSearchInputChange={handleInput} handleSearchEvent={handleSubmit} />)
    const searchInput = screen.getByPlaceholderText('Vuosi tai numero/vuosi')
   
    // Testaa hakukentän toimintaa.
    fireEvent.change(searchInput, { target: {value: "Test"}})
    expect(handleInput).toHaveBeenCalled()
    
})

test('call handleInput', async () => {
    const user = userEvent.setup()
    const handleInput = vi.fn()
    const handleSubmit = vi.fn()
    const language = "fin"

    const search: string = '' 

    render(<SearchForm language={language} search={search} handleSearchInputChange={handleInput} handleSearchEvent={handleSubmit} />)
    const searchInput = screen.getByPlaceholderText('Vuosi tai numero/vuosi')
    const button = screen.getByText("Hae")
   
    // Testaa että hakukentän toimintaa.
    await user.type(searchInput, "Testi")
    await user.click(button)
    console.log(handleSubmit.mock.calls[0][0].target)
    
})