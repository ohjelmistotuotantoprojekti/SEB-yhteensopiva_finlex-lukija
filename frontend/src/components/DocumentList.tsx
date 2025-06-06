import type {DocumentListProps, Document} from "../types"
import {nanoid} from 'nanoid'


const DocumentList = ({laws, frontsection}: DocumentListProps) => {
 

  const listStyle = {
    width: "500px",
    backgroundColor: "#eeeeee",
    padding: '10px',
    margin: '4px',
  }

  function prepareLink(doc: Document): string {
    return `/${frontsection}/${doc.docYear}/${doc.docNumber}${doc.docLevel ? `/${doc.docLevel}` : ""}`;
  }

  function prepareLabel(doc: Document): string {
    if (doc.docLevel) {
      return `${doc.docLevel.toUpperCase()}:${doc.docYear}:${doc.docNumber}`;
    }
    else {
      return `${doc.docNumber}/${doc.docYear}`;
    }
  }

  function prepareKey(doc: Document): string {
    return `${doc.docLevel ? doc.docLevel : ""}${doc.docYear}${doc.docNumber}${nanoid(2)}`;
  }
  
  return (
    <>
    { laws.map((law) => 
        <div style={listStyle} key={prepareKey(law)} >
          <a href={prepareLink(law)}>
            {prepareLabel(law)} {law.docTitle ? law.docTitle : ""}
          </a>
        </div>
      )
    }
    </>
  )
}

export default DocumentList