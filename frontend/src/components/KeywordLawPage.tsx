import axios from 'axios'
import { useState} from 'react'
import type { KeywordPage } from "../types"
import { useParams } from 'react-router-dom'
import {Helmet} from "react-helmet";
import TopMenu from './TopMenu'


const KeywordLawPage = ({language} : KeywordPage) => {

    const keyword: string = useParams().keyword ?? ""
    const [laws, setLaws] = useState([])
    const [lan, setLan] = useState<string>(language)
    let path = `/api/statute/keyword/${keyword}`
    const title: string = language==="fin" ? "Asiasanat" : "Ämnesord"

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

    const listStyle = {
      width: "500px",
      backgroundColor: "#F3F8FC",
      padding: '10px',
      margin: '4px',
    }

    const getLaws = async (path: string) => {
        const resp = await axios.get(path)
        console.log(resp.data)
        setLaws(resp.data)
    }
    getLaws(path)

    function prepareLink(law) {
        return `/lainsaadanto/${law.law_year}/${law.law_number}`;
      }

    const handleSelect = (event: React.SyntheticEvent) => {
      const currentValue = (event.target as HTMLInputElement).value
      setLan(currentValue)
      localStorage.setItem("language", currentValue)
      getLaws(path)
      
    }

  return (
    <>
    <Helmet>
      <title>
        {title}
      </title>
    </Helmet>
    <div id="topId" style={topStyle}>  
     <TopMenu language={lan} handleSelect={handleSelect} />
    </div>
    <h1>{title}</h1>
    <h2>{keyword}</h2>
    {laws.map(law => 
        <div style={listStyle} key={keyword}>
            <a href={prepareLink(law)}>
            {law.law_number}/{law.law_year} - {law.law_title}
          </a>
        </div>
    )}
    </>
  )
}

export default KeywordLawPage