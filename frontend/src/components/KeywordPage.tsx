import axios from 'axios'
import type { KeywordPage } from "../types"
import { useState } from 'react'
import {Helmet} from "react-helmet";
import TopMenu from './TopMenu'



const KeywordPage = ({language} : KeywordPage) => {
  

    const [keywords, setKeywords] = useState([])
    const [lan, setLan] = useState<string>(language)
    let path = `/api/statute/keywords/${language}`
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

    const contentStyle = {
      display: 'flex',
      justifyContent: 'center',
      width: '100%',
      padding: '5px',
    }

    const contentContainerStyle = {
      width: '700px',
      border: '0px solid black',
      marginTop:'50px',
    }

    

    const getKeywords = async (path: string) => {
        const keywords = await axios.get(path)
        setKeywords(keywords.data)
    }
    getKeywords(path)

    /*
    function prepareLink(keyword) {
        const keyword = 
        return `/lainsaadanto/${law.law_year}/${law.law_number}`;
      }
      */

    const handleSelect = (event: React.SyntheticEvent) => {
      const currentValue = (event.target as HTMLInputElement).value
      setLan(currentValue)
      localStorage.setItem("language", currentValue)
      getKeywords(path)
      
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
        {keywords.map(keyword => 
            <div key={keyword}>
                <a href="/lainsaadanto/">{keyword}</a>
            </div>
        )}
      </div>
    </div>
    </>
  )
}

export default KeywordPage
