import axios from 'axios'
import { useState } from 'react'
import type {Law, Props} from '../types'
import { useParams } from 'react-router-dom'
import XMLParser from 'react-xml-parser'



const LawPage = ({server}: Props) => {

   const docnumber: string = useParams().id
   const docyear: string = useParams().year


  // Tallentaa hakukentän (komponentilta SearchForm) tilan.
  
  const [year, setYear] = useState<string>('')
  const [number, setNumber] = useState<string>('')
  const [law, setLaw] = useState<string>('')




  // Hakee backendiltä dataa
  const getJson = async (path: string) => {
    const url: string = `${server}${path}`
    const response = await axios.get(url)

     // Parsi XML data JSON-muotoon
    const xmlData: string = response.data as string
   // const jsonData =  new XMLParser().parseFromString(xmlData)
   
    setLaw(xmlData)
  }

  getJson(`/api/statute-consolidated/id/${docyear}/${docnumber}`) 
  
 
  return (

    <div>
    <h3>Lakiteksti:</h3>
    <p><a href="/">Takaisin etusivulle</a></p>

   {law}
    </div>

  )

}


export default LawPage