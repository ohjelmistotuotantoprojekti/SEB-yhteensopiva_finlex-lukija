import axios from 'axios'
import type {Lang } from "../types"
import { useState } from 'react'
import { useParams } from 'react-router-dom'


const LawPage = ({language} :Lang) => {

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
      const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
      const xsltDoc = parser.parseFromString(xsltText, 'text/xml');
      
      // Muunna XML HTML:ksi
      const xsltProcessor = new XSLTProcessor();
      xsltProcessor.importStylesheet(xsltDoc);
      const resultDocumentFragment = xsltProcessor.transformToFragment(xmlDoc, document);
      const container = document.createElement('div');
      container.appendChild(resultDocumentFragment);
      const transformedHtml = container.innerHTML;
      
      // Tallenna HTML tilaan
      setLaw(transformedHtml)
    }
    catch (error) {
      console.error(error)
    }
  }

  getHtml(`/api/statute/id/${docyear}/${docnumber}/${language}`) 
  
  return (
    <div>
    <p><a href="/">{language==="fin" ? "Etusivulle" : "Till framsidan"}Takaisin etusivulle</a></p>
     <div dangerouslySetInnerHTML={{ __html: law }} />
    </div>
  )
}

export default LawPage