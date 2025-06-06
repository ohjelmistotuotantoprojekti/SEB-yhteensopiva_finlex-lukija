import type {Judgment} from "../types"
import {nanoid} from 'nanoid'


const CaseLawList = ({laws}: {laws: Judgment[]}) => {

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
        <a href={`/oikeuskaytanto/${law.docYear}/${law.docNumber}/${law.docLevel}`}>{law.docLevel.toUpperCase()}:{law.docYear}:{law.docNumber}</a></div>
      )
    }
    </>
  )
}

export default CaseLawList