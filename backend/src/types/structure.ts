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

export interface Heading {
    id: string,
    name: string,
    content: Heading[]
}


