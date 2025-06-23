import axios from 'axios'
import { useState} from 'react'
import type { KeywordPageType, LawByKey } from "../types"
import { useParams } from 'react-router-dom'
import {Helmet} from "react-helmet";
import TopMenu from './TopMenu'


const KeywordLawPage = ({language} : KeywordPageType) => {

    const keyword_id: string = useParams().keyword_id ?? ""
    const [laws, setLaws] = useState<LawByKey[]>([])
    const [lan, setLan] = useState<string>(language)
    const path = `/api/statute/keyword/${lan}/${keyword_id}`
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

    const listStyle: React.CSSProperties = {
      width: "500px",
      backgroundColor: "#F3F8FC",
      padding: '10px',
      margin: '4px',
    }

    const contentStyle: React.CSSProperties = {
      display: 'flex',
      justifyContent: 'center',
      width: '100%',
      padding: '5px',
    }

    const contentContainerStyle: React.CSSProperties = {
      width: '700px',
      border: '0px solid black',
      marginTop:'50px',
    }

    const getLaws = async (path: string) => {
        const resp = await axios.get(path)
        setLaws([])
        setLaws(resp.data)
    }
    getLaws(path)

    function prepareLink(law: LawByKey): string {
        return `/lainsaadanto/${law.year}/${law.number}`;
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
    <div style={contentStyle} id="contentdiv">
      <div id="contentDiv" style={contentContainerStyle}>
        <h1>{title}</h1>

        {laws.map(law => 
            <div style={listStyle} key={law.number}>
                <a href={prepareLink(law)}>
                {law.number}/{law.year} - {law.title}
              </a>
            </div>
        )}
      </div>
    </div>
    </>
  )
}

export default KeywordLawPage