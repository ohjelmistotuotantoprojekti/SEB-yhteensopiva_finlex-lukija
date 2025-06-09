import type {DocumentListProps, Document} from "../types"
import {nanoid} from 'nanoid'


const DocumentList = ({laws, frontsection, language}: DocumentListProps) => {
 

  const listStyle = {
    width: "500px",
    backgroundColor: "#F3F8FC",
    padding: '10px',
    margin: '4px',
  }

  const tagStyle = {
    display: 'inline-block',
    padding: '0.6em 0.6em',
    fontSize: '0.9em',
    color: '#721c24',
    backgroundColor: '#f8d7da',
    border: '1px solid #f5c6cb',
    borderRadius: '0.25rem',
    lineHeight: 1,
    whiteSpace: 'normal'
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
  
  const emptyTagName = language === 'fin' ? 'Tyhjä': 'Tom'
  return (
    <>
    { laws.map((law) => 
        <div style={listStyle} key={prepareKey(law)} >
          {law.isEmpty ? <span style={tagStyle}>{emptyTagName}</span>: ""}
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