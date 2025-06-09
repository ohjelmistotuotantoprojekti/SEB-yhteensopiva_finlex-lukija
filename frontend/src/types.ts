 
 export interface Law {
  docYear:  string,
  docNumber: string,
  docTitle: string
}

 export interface Judgment {
  docYear:  string,
  docNumber: string,
  docLevel: string
}

 export interface Document {
  docYear:  string,
  docNumber: string,
  docLevel?: string,
  docTitle?: string
  isEmpty?: boolean,
}

export interface DocumentPageProps {
  apipath: string,
  backpath: string,
  backtext: string,
  language: string
}

export interface ListDocumentPageProps {
  buttonetext: string,
  placeholdertext: string,
  apisection: string,
  frontsection: string,
  pagetitle: string,
  language: string,
  setLanguage: (Status: string) => void
}

export interface DocumentListProps {
  laws: Document[],
  frontsection: string
}

export interface Props {
  search: string,
  handleSearchInputChange: (event: React.SyntheticEvent) => void,
  handleSearchEvent: (event: React.SyntheticEvent) => void,
  buttontext: string
  placeholdertext: string 
}

export interface Server {
  server: string,
}

export interface Lang {
  language: string,
  setLanguage: (Status: string) => void
}

export interface Headings {
    name: string,
    id: string,
    content: {
        name: string,
        id: string,
        content: never[]
    }[]
}