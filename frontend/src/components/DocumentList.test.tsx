import { render, screen } from '@testing-library/react'
import type {Law} from '../types'
import DocumentList from './DocumentList'


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
   
    render(<DocumentList laws={laws} frontsection={"statute"} />)
    const element = screen.getByText('123/2000 - Title')
    expect(element).toBeDefined()
    const element2 = screen.getByText('321/2000 - Title2')
    expect(element2).toBeDefined()
    


})