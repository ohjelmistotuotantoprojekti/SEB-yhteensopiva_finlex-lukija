import { render, screen } from '@testing-library/react'
import {Law} from '../types'
import LawList from './LawList'



test('renders content', () => {

   const laws: Law[] = [
    {
        docYear:  '2000',
        docNumber: '123',
        docTitle: 'Title'
    },
    {
        docYear:  '2000',
        docNumber: '321',
        docTitle: 'Title2'
    },]
   

    render(<LawList laws={laws} />)
    const element = screen.getByText('Title')
    expect(element).toBeDefined()
    const element2 = screen.getByText('Title2')
    expect(element2).toBeDefined()
    


})