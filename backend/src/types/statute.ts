export interface Statute {
    uuid: string;
    title: string;
    number: string;
    year: number;
    language: string;
    version: string | null;
    content: string;
    is_empty: boolean;
}

export interface StatuteKey {
    number: string;
    year: number;
    language: string;
    version: string | null;
    commonName?: string;
}

export interface StatuteListItem {
    docYear: number;
    docNumber: string;
    docTitle: string;
    isEmpty: boolean;
    docVersion: string | null;
}

export interface KeyWord {
    id: string;
    keyword: string;
    statute_uuid: string;
    language: string;
}

export interface StatuteSearchResult {
    year_num: number;
    number: string;
    title: string;
    has_content: number;
    version: string | null;
}
