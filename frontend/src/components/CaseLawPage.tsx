import axios from 'axios'
import type { Headings, Lang } from "../types"
import { useState } from 'react'
import TableOfContent from './TableOfContent'
import { useParams } from 'react-router-dom'
import {Helmet} from "react-helmet";



const CaseLawPage = ({language} : Lang) => {

  const docnumber: string = useParams().id ?? ""
  const docyear: string = useParams().year ?? ""
  const doclevel: string = useParams().level ?? ""


  const backpath: string = "/oikeuskaytantohaku/"
  const backtext: string = language==="fin" ? "Takaisin" : "Tillbaka"
  
  const [docTitle, setDocTitle] = useState<string>("Finlex Lite")
  const [law, setLaw] = useState<string>('')
  const [headings, setHeadings] = useState<Headings[]>([])


  const topStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'flex-start',
    alignContent: 'center',
    width: '100%',
    height: '50px',
    backgroundColor: '#0C6FC0',
    padding: '2px',
    margin: '2px',
  }

  const contentStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
    padding: '5px',
    margin: '10px',
  }

   const contentBlockStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
    padding: '10px',
    margin: '10px',
  }
   const tocStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
    padding: '10px',
    margin: '10px',
  }

  if (docnumber === "" ) {
    throw new Error("Unexpected error: Missing docnumber")
  }
  if (docyear === "" ) {
    throw new Error("Unexpected error: Missing docyear")
  }

  // Hakee backendiltä dataa
  const getHtml = async (path: string) => {

    try {
      // Hae XML (APIsta)
      const htmlResp = await axios.get(path)
      const htmlText: string = htmlResp.data
      setLaw(htmlText)
    }
    catch (error) {
      console.error(error)
    }
  }
   
   // Hakee backendiltä sisällysluettelon
  const getHeadings = async () => {

    setHeadings([])
  }

  // estää sivua lataamasta usemapaan kertaan.
  if (law === '') {
    getHtml(`/api/judgment/id/${docyear}/${docnumber}/${language}/${doclevel}`) 
  }

  // estää sisällysluetteloa lataamsta moneen kertaan silloin kun lista on saatu palvelimelta. 
  // Muussa tapauksessa se koittaa ladata sitä uudestaan joka tapuksessa.
  //if (headings.length < 1) {
  //  getHeadings()
  //}

  return (
    <>
    <Helmet>
      <title>
        {docTitle}
      </title>
    </Helmet>
    <div id="topId" style={topStyle}>
    <a href={backpath}>{backtext}</a>
    </div>

  
    <div id="contentDiv" style={contentStyle}>

    <div id="contentBlock" style={contentBlockStyle}>
      <div id="leftMargin" style={tocStyle}><TableOfContent headings={headings} /></div>
      <div dangerouslySetInnerHTML={{ __html: law}}>
      </div>
    </div>
    </div>
    </>
  )
}

export default CaseLawPage
