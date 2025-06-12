export interface Akoma {
    uuid: string;
    title: string;
    number: string;
    year: number;
    language: string;
    content: string;
    is_empty: boolean;
}

export interface LawKey {
    number: string;
    year: number;
    language: string;
    commonName?: string;
}

export interface CommonName {
    uuid: string;
    commonName: string;
    number: string;
    year: number;
    language: string;
}
