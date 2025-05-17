import axios from 'axios'
import { useState } from 'react'
import type {Server} from '../types'
import { useParams } from 'react-router-dom'


const LawPage = ({server}: Server) => {

  const docnumber: string = useParams().id ?? ""
  const docyear: string = useParams().year ?? ""
  const [law, setLaw] = useState<string>('')

  if (docnumber === "" ) {
    throw new Error("Unexpected error: Missing docnumber");
  }
  if (docyear === "" ) {
    throw new Error("Unexpected error: Missing docyear");
  }

  // Hakee backendiltä dataa
  const getJson = async (path: string) => {

    try {
      const url: string = `${server}${path}`
      const response = await axios.get(url)

      // Parsi XML data JSON-muotoon
      const xmlData: string = response.data as string
   
      setLaw(xmlData)
    }
    catch (error) {
      console.error(error)
    }
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