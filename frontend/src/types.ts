 
 export interface Law {
  docYear:  string,
  docNumber: string,
  docTitle: string
}

export interface Props {
  search: string,
  server: string,
  handleSearchInputChange: (event: React.SyntheticEvent) => void,
  handleSearchEvent: (event: React.SyntheticEvent) => void,
 
}
