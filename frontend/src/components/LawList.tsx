import type {Law} from "../types"
import {nanoid} from 'nanoid'



const LawList = ({laws}: {laws: Law[]}) => {

  const listStyle = {
    width: "500px",
    backgroundColor: "#eeeeee",
    padding: '10px',
    margin: '4px',
  }
  
  return (
    <>
  
    { laws.map((law) => 
         
        <div style={listStyle} key={`${law.docYear}${law.docNumber}${nanoid(2)}`} >{law.docYear}/{law.docNumber} {law.docTitle}</div>
      )
    }


  
    </>
  )

}


export default LawList