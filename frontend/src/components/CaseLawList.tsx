import type {Document} from "../types"
import {nanoid} from 'nanoid'


const CaseLawList = ({laws}: {laws: Document[]}) => {
  const frontsection = "oikeuskaytanto"

  const listStyle = {
    width: "500px",
    backgroundColor: "#eeeeee",
    padding: '10px',
    margin: '4px',
  }
  
  return (
    <>
    { laws.map((law) => 
        <div style={listStyle} key={`${law.docLevel}${law.docYear}${law.docNumber}${nanoid(2)}`} >
        <a href={`/${frontsection}/${law.docYear}/${law.docNumber}/${law.docLevel}`}>
        {law.docLevel ? law.docLevel.toUpperCase(): ""}{law.docTitle ? law.docTitle.toUpperCase(): ""}:{law.docYear}:{law.docNumber}</a></div>
      )
    }
    </>
  )
}

export default CaseLawList