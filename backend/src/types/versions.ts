export interface StatuteVersion {
  baseUri: string;      // URI without version
  language: string;     // 'fin' or 'swe'
  year: string;        // year after @, if any
  number: string;      // number after year, if any
  fullUri: string;     // complete original URI
}

export interface StatuteVersionResponse {
  akn_uri: string;
  status: string;
}