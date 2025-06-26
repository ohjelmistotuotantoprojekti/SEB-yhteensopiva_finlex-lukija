export interface Judgment {
    uuid: string;
    level: string;
    number: string;
    year: string;
    language: string;
    content: string;
    is_empty: boolean;
  }

export interface JudgmentKey {
    level: string;
    number: string;
    year: number;
    language: string;
}

export interface JudgmentListItem {
    docYear: number;
    docNumber: string;
    docLevel: string;
    isEmpty: boolean;
    keywords?: string[];
}

export interface JudgmentSearchResult {
    year_num: number;
    number: string;
    level: string;
    has_content: number;
    keywords: string[];
}

export interface JudgmentKeyWord {
    id: string;
    keyword: string;
    judgment_uuid: string;
    language: string;
}
