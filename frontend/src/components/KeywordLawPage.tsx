import axios from 'axios'
import { useState} from 'react'
import type { KeywordPage } from "../types"
import { useParams } from 'react-router-dom'
import {Helmet} from "react-helmet";



const KeywordLawPage = ({language} : KeywordPage) => {

    const keyword: string = useParams().keyword ?? ""
    const [laws, setLaws] = useState([])
    let path = `/api/statute/keyword/${keyword}`
    const title: string = language==="fin" ? "Asiasanat" : "Ämnesord"

    const getLaws = async (path: string) => {
        const resp = await axios.get(path)
        console.log(resp.data)
        setLaws(resp.data)
    }
    getLaws(path)

    function prepareLink(law) {
        return `/lainsaadanto/${law.law_year}/${law.law_number}`;
      }

  return (
    <>
    <Helmet>
      <title>
        {title}
      </title>
    </Helmet>
    <h1>{title}</h1>
    <h2>{keyword}</h2>
    {laws.map(law => 
        <div key={keyword}>
            <a href={prepareLink(law)}>
            {law.law_number}/{law.law_year} - {law.law_title}
          </a>
        </div>
    )}
    </>
  )
}

export default KeywordLawPage