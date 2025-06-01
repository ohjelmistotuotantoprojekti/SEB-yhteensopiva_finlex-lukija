import axios from 'axios'
import type {Lang } from "../types"
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import TableOfContent from './TableOfContent'


const LawPage = ({language} :Lang) => {

  const docnumber: string = useParams().id ?? ""
  const docyear: string = useParams().year ?? ""
  const [law, setLaw] = useState<string>('')

  const topStyle = {
    display: 'flex',
    justifyContent: 'flex-start',
    alignContent: 'center',
    width: '100%',
    height: '50px',
    backgroundColor: '#0C6FC0',
    padding: '2px',
    margin: '2px',
  }

  const contentStyle = {
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
    padding: '5px',
    margin: '10px',
  }

   const contentBlockStyle = {
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
    padding: '50px',
    margin: '10px',
  }
   const tocStyle = {
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
    padding: '0px',
    margin: '0px',
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
      
      const bodyarr = Array.from (container.querySelectorAll("article"))
      if(bodyarr.length >= 1) {
          const body = bodyarr[0].innerHTML
      // Tallenna HTML tilaan
        setLaw(body)
      }/*
      else {
        setLaw("no text")
      }*/
    }
    catch (error) {
      console.error(error)
    }
  }
   
  getHtml(`/api/statute/id/${docyear}/${docnumber}/${language}`) 
  /*const toc = [{'Ylätason otskko':['Alaotsikko 1', 'alaotsikko 2']},
  {'Ylätason otskko 2':['Alaotsikko 1', 'alaotsikko 2']}
]*/
  
  return (
    <>
    <div id="topId" style={topStyle}>
    <p><a href="/">{language==="fin" ? "Etusivulle" : "Till framsidan"}</a></p>
    </div>

  
    <div id="contentDiv" style={contentStyle}>

    <div id="contentBlock" style={contentBlockStyle}>
      <div id="leftMargin" style={tocStyle}><TableOfContent /></div>
      <div dangerouslySetInnerHTML={{ __html: law}}>
      </div>
    </div>
    </div>
    </>
  )
}

export default LawPage