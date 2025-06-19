import type {DocumentListProps, Document} from "../types"

function getCourtName(level: string, language: string): string {
  if (language === 'swe') {
    return level.toLowerCase() === 'kko' ? 'HD' : 'HFD';
  }
  return level.toUpperCase();
}


const DocumentList = ({laws, frontsection, language}: DocumentListProps) => {
 

  const listStyle = {
    width: "500px",
    backgroundColor: "#F3F8FC",
    padding: '10px',
    margin: '4px',
  }

  const tagStyle = {
    display: 'inline-block',
    padding: '1px 5px',
    marginRight: '5px',
    color: '#721c24',
    fontSize: '12px',
    backgroundColor: '#f8d7da',
    border: '1px solid #f5c6cb',
    borderRadius: '2px',
    whiteSpace: 'normal'
  }

  function prepareLink(doc: Document): string {
    return `/${frontsection}/${doc.docYear}/${doc.docNumber}${doc.docLevel ? `/${doc.docLevel}` : ""}`;
  }

  function prepareLabel(doc: Document): string {
    if (doc.docLevel) {
      const courtName = getCourtName(doc.docLevel, language);
      return `${courtName}:${doc.docYear}:${doc.docNumber}`;
    }
    else {
      return `${doc.docNumber}/${doc.docYear}`;
    }
  }

  function prepareKey(doc: Document): string {
    return `${doc.docLevel ? doc.docLevel : ""}${doc.docYear}${doc.docNumber}${language}`;
  }
  
  const emptyTagName = language === 'fin' ? 'Tyhjä': 'Tom'
  return (
    <>
    { laws.map((law) => 
        <div style={listStyle} key={prepareKey(law)} >
          {law.isEmpty ? <span style={tagStyle}>{emptyTagName}</span>: ""}
          <a href={prepareLink(law)}>
            <b>{prepareLabel(law)}</b> {law.docTitle ? `- ${law.docTitle}` : ""}
          </a>
        </div>
      )
    }
    </>
  )
}

export default DocumentList