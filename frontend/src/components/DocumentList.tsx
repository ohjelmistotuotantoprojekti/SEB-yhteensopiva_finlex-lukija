import type {DocumentListProps, Document} from "../types"
import {nanoid} from 'nanoid'


const DocumentList = ({laws, frontsection}: DocumentListProps) => {
 

  const listStyle = {
    width: "500px",
    backgroundColor: "#F3F8FC",
    padding: '10px',
    margin: '4px',
  }

  const tagStyle = {
    display: 'inline-block',
    padding: '0.6em 0.6em',
    'font-size': '0.9em',
    color: '#721c24',
    'background-color': '#f8d7da',
    border: '1px solid #f5c6cb',
    'border-radius': '0.25rem',
    'line-height': 1,
    'white-space': 'normal'
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
          {law.isEmpty ? <span style={tagStyle}>Empty</span>: ""}
          <a href={prepareLink(law)}>
            {prepareLabel(law)} {law.docTitle ? `- ${law.docTitle}` : ""}
          </a>
        </div>
      )
    }
    </>
  )
}

export default DocumentList