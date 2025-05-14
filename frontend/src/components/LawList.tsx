import type {Law} from "../types"


const LawList = ({laws}: {laws: Law[]}) => {

  const listStyle = {
    width: "500px",
    backgroundColor: "#eeeeee",
    padding: '10px',
    margin: '4px',
  }

  return (
    <>
   
    { laws.map((law) =><div style={listStyle} key={law.docNumber}>{law.docYear}/{law.docNumber} {law.docTitle}</div>) }
  
    </>
  )

}


export default LawList