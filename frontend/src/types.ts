 
 export interface Law {
  docYear:  string,
  docNumber: string,
  docTitle: string
}

export interface Props {
  search: string,
  ref: React.RefObject<HTMLFormElement | null> | null,
  handleSearchInputChange: (event: React.SyntheticEvent) => void,
  handleSearchEvent: (event: React.SyntheticEvent) => void,
  language: string
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