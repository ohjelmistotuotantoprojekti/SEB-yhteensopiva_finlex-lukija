import axios from 'axios'
import type { Headings, DocumentPageProps } from "../types"
import { useState} from 'react'
import TableOfContent from './TableOfContent'
import { useParams } from 'react-router-dom'
import {Helmet} from "react-helmet";
import TopMenu from './TopMenu'


const DocumentPage = ({language, apipath, backpath, backtext} : DocumentPageProps) => {

  const docnumber: string = useParams().id ?? ""
  const docyear: string = useParams().year ?? ""
  const doclevel: string = useParams().level ?? ""

  const [docTitle, setDocTitle] = useState<string>("Finlex Lite")
  const [law, setLaw] = useState<string>('')
  const [headings, setHeadings] = useState<Headings[]>([])
  const [lan, setLan] = useState<string>(language)
  let path = `/api/${apipath}/id/${docyear}/${docnumber}/${lan}`
  let headerpath = `/api/${apipath}/structure/id/${docyear}/${docnumber}/${lan}/`

  if (apipath !== "statute") {
      path = `/api/${apipath}/id/${docyear}/${docnumber}/${lan}/${doclevel}`
  }

  const topStyle: React.CSSProperties = {
    display: 'flex',
    position: 'fixed',
    top: '0px',
    left: '0px',
    justifyContent: 'center',
    alignContent: 'center',
    width: '100%',
    height: '50px',
    backgroundColor: '#0C6FC0',
    padding: '0px',
    margin: '0px',
    border: '0px solid red'
  }

  const contentStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
    padding: '5px',
    margin: '10px',
    border: '0px solid blue'
    
  }

  const returnStyle: React.CSSProperties = {
    padding: '20px'
  }

   const contentBlockStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
    padding: '0px',
    margin: '0px',
    marginTop: '70px',
    border: '0px solid pink'
  }
   const tocStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'start',
    width: '350px',
    padding: '00px',
    margin: '10px',
    border: '0px solid yellow',
  }

  const docBodyStyle: React.CSSProperties = {
    width: '600px',
    border: '0px solid pink'
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
      // Hae HTML (APIsta)
      const htmlResp = await axios.get(path)
      const htmlText: string = htmlResp.data
      setLaw(htmlText)
    }
    catch (error) {
      console.error(error)
    }
  }

   // Hakee backendiltä dataa
  const getLawHtml = async (path: string) => {
   
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

  const handleSelect = (event: React.SyntheticEvent) => {
      const currentValue = (event.target as HTMLInputElement).value
      setLan(currentValue)
      localStorage.setItem("language", currentValue)
      
      if(apipath === "statute") {
        path = `/api/${apipath}/id/${docyear}/${docnumber}/${currentValue}`
      } else {
        path = `/api/${apipath}/id/${docyear}/${docnumber}/${currentValue}/${doclevel}`
      }
      
      headerpath = `/api/${apipath}/structure/id/${docyear}/${docnumber}/${currentValue}/`
      updateHTML()
      
  }

  const updateHTML = () => {
        if(apipath === "statute") {
          getLawHtml(path) 
        } else {
          getHtml(path) 
        }
        getHeadings()
  }

   // Hakee backendiltä sisällysluettelon
  const getHeadings = async () => {

    try {
      const response = await axios.get(`${headerpath}${doclevel ? doclevel : ''}`)
      setHeadings(response.data)
    } catch(error) {
      console.error(error)
    }
  }
   
  // estää sivua lataamasta usemapaan kertaan.
  if (law === '') {
    updateHTML()
  }

  // estää sisällysluetteloa lataamasta moneen kertaan silloin kun lista on saatu palvelimelta. 
  // Muussa tapauksessa se koittaa ladata sitä uudestaan joka tapauksessa.
  if(headings.length < 1) {
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
       
     <TopMenu language={lan} handleSelect={handleSelect} />
    </div>

    <div id="contentDiv" style={contentStyle}>
      <div id="contentBlock" style={contentBlockStyle}>
        <div id="returndiv" style={returnStyle}>
          <a href={backpath}>{backtext}</a>
        </div>
        <div id="leftMargin" style={tocStyle}>
          
          <TableOfContent headings={headings} />
          
        </div>
        
        <div id="documentbodydiv" style={docBodyStyle} dangerouslySetInnerHTML={{ __html: law}}></div>
      </div>
    </div>
    </>
  )
}

export default DocumentPage
