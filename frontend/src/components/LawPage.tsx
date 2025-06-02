import axios from 'axios'
import type {Lang } from "../types"
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import TableOfContent from './TableOfContent'



const LawPage = ({language} :Lang) => {

  const docnumber: string = useParams().id ?? ""
  const docyear: string = useParams().year ?? ""
  const [law, setLaw] = useState<string>('')

  
    const headings = [
    {
        "name": "1 luku - Yleiset säännökset",
        "id": "chp_1__heading",
        "content": [
            {
                "name": "1 § - Lain tavoite",
                "id": "chp_1__sec_1__heading",
                "content": []
            },
            {
                "name": "2 § - Lain soveltamisala",
                "id": "chp_1__sec_2__heading",
                "content": []
            },
            {
                "name": "3 § - Määritelmät",
                "id": "chp_1__sec_3__heading",
                "content": []
            },
            {
                "name": "4 § - Kansainväliset sopimukset",
                "id": "chp_1__sec_4__heading",
                "content": []
            },
            {
                "name": "5 § - Euroopan unionin direktiivit",
                "id": "chp_1__sec_5__heading",
                "content": []
            },
            {
                "name": "6 § - Saamelaiskulttuurin suoja",
                "id": "chp_1__sec_6__heading",
                "content": []
            },
            {
                "name": "7 § - Varovaisuusperiaate",
                "id": "chp_1__sec_7__heading",
                "content": []
            },
            {
                "name": "8 § - Ympäristötietoisuuden edistäminen",
                "id": "chp_1__sec_8__heading",
                "content": []
            }
        ]
    },
    {
        "name": "2 luku - Luonnonsuojelun viranomaiset ja muut toimijat",
        "id": "chp_2__heading",
        "content": [
            {
                "name": "9 § - Luonnonsuojelun valtion viranomaiset",
                "id": "chp_2__sec_9__heading",
                "content": []
            },
            {
                "name": "10 § - Luonnonsuojelun asiantuntijaviranomaiset",
                "id": "chp_2__sec_10__heading",
                "content": []
            },
            {
                "name": "11 § - Kunta",
                "id": "chp_2__sec_11__heading",
                "content": []
            },
            {
                "name": "12 § - Suomen luontopaneeli",
                "id": "chp_2__sec_12__heading",
                "content": []
            }
        ]
    }
]

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
   
  getHtml(`/api/statute/id/${docyear}/${docnumber}/${language}`) 

  
  return (
    <>
    <div id="topId" style={topStyle}>
    <p><a href="/">{language==="fin" ? "Etusivulle" : "Till framsidan"}</a></p>
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