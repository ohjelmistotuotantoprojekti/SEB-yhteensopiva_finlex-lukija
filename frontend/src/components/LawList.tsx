import type {Law} from "../types"
import {nanoid} from 'nanoid'


const LawList = ({laws}: {laws: Law[]}) => {

  if (laws.length < 1) {
    return <></>
  }
  console.log("lawlist", laws)
  const listStyle = {
    width: "500px",
    backgroundColor: "#eeeeee",
    padding: '10px',
    margin: '4px',
  }
  
  return (
    <>
    { laws.map((law) => 
        <div style={listStyle} key={`${law.docYear}${law.docNumber}${nanoid(2)}`} >{law.docNumber}/{law.docYear} &nbsp;
        <a href={`/lainsaadanto/${law.docYear}/${law.docNumber}`}>{law.docTitle}</a></div>
      )
    }
    </>
  )
}

export default LawList