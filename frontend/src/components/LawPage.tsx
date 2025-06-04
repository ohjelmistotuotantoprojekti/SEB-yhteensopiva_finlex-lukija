import axios from 'axios'
import type {Lang, Headings } from "../types"
import { useState } from 'react'
import TableOfContent from './TableOfContent'
import { useParams } from 'react-router-dom'
import {Helmet} from "react-helmet";



const LawPage = ({language} :Lang) => {

  const docnumber: string = useParams().id ?? ""
  const docyear: string = useParams().year ?? ""
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
      const xmlResp = await axios.get(path)
      const xmlText: string = xmlResp.data
      
      // Hae XSLT (tiedostosta)
      const xsltResp = await axios.get('/akomo_ntoso.xsl')
      const xsltText: string = xsltResp.data
      
      // Parsi XML ja XSLT
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, 'text/xml')
      const xsltDoc = parser.parseFromString(xsltText, 'text/xml')
      
      // Muunna XML HTML:ksi
      const xsltProcessor = new XSLTProcessor()
      xsltProcessor.importStylesheet(xsltDoc)
      const resultDocumentFragment = xsltProcessor.transformToFragment(xmlDoc, document)
      const container = document.createElement('div')
      container.appendChild(resultDocumentFragment)

      // poimi lain otsikko
      setDocTitle(xmlDoc.querySelector("docTitle")?.textContent || "Lain otsikko puuttuu")
      
      // poimitaan vain se mitä on <article> -tagien sisällä.
      const bodyarr = Array.from (container.querySelectorAll("article"))
      if(bodyarr.length >= 1) {
          const body = bodyarr[0].innerHTML
      // Tallenna HTML tilaan
        setLaw(body)
      }
    }
    catch (error) {
      console.error(error)
    }
  }
   
   // Hakee backendiltä sisällysluettelon
  const getHeadings = async () => {

    try {
      console.log("getting ", docyear,"/", docnumber," ", language)
      const response = await axios.get(`/api/statute/structure/id/${docyear}/${docnumber}/${language}`)
      console.log("response", response.data)
      setHeadings(response.data)
    } catch(error) {
      console.error(error)
    }
  }

  if (law === '') {
    getHtml(`/api/statute/id/${docyear}/${docnumber}/${language}`) 
  }
  if (headings.length < 1) {
    getHeadings()
  }

  return (
    <>
    <Helmet>
      <title>
        {docTitle}
      </title>
    </Helmet>
    <div id="topId" style={topStyle}>
    <a href="/">{language==="fin" ? "Takaisin" : "Tillbaka"}</a>
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

export default LawPage
