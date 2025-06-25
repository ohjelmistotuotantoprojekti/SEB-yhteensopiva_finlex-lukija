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
}
