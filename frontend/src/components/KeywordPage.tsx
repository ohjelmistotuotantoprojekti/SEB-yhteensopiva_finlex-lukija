import axios from 'axios'
import type { DocumentPageProps } from "../types"
import { useState} from 'react'
import {Helmet} from "react-helmet";



const KeywordPage = ({language} : DocumentPageProps) => {

    const [keywords, setKeywords] = useState([])
    let path = `/api/statute/keywords/${language}`
    const title: string = language==="fin" ? "Asiasanat" : "Ämnesord"

    const getKeywords = async (path: string) => {
        const keywords = await axios.get(path)
        setKeywords(keywords.data)
    }
    getKeywords(path)

  return (
    <>
    <Helmet>
      <title>
        {title}
      </title>
    </Helmet>
    <h1>{title}</h1>
    {keywords.map(keyword => 
        <div key={keyword}>
            <p>{keyword}</p>
        </div>
    )}
    </>
  )
}

export default KeywordPage
