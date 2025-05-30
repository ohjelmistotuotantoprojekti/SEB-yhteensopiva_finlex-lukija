export interface Structure {
    akomaNtoso: {
        act: [
            {body: [
                {hcontainer: [
                    {chapter: [
                        {num: string [],
                        heading: [
                            {_: string}
                        ],
                        section: [
                            {num: string [],
                            heading: [
                                {_: string}
                            ]}
                        ]}
                    ]}
                ]}
            ]}
        ]
    }
}

export interface HeadingList {
    [chapterTitle: string]: string[];
}