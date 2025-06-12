export interface Akoma {
    uuid: string;
    title: string;
    number: string;
    year: number;
    language: string;
    version: string | null;
    content: string;
    is_empty: boolean;
}

export interface LawKey {
    number: string;
    year: number;
    language: string;
    version: string | null;
}
