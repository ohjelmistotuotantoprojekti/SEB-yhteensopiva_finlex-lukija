 
 export interface Law {
  docYear:  string,
  docNumber: string,
  docTitle: string
}

export interface Props {
  search: string,
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