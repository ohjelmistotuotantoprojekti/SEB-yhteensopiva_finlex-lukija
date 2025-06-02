export interface Structure {
    akomaNtoso: {
        act:
            {body:
                {hcontainer: [
                    {chapter: [
                        {num: string,
                        heading: {
                            $: {eId: string},
                            _: string
                        },
                        section: [
                            {num: string,
                            heading: {
                            $: {eId: string},
                            _: string
                        }}
                        ]}
                    ]}
                ]}
            }
    }
}
export interface subHeadingEntry {
    [subTitle: string]: {
                id: string,
                content: []
            }
}
export interface Headings {
    [chapterTitle: string]: {
        id: string,
        content: subHeadingEntry[]
    }
}


