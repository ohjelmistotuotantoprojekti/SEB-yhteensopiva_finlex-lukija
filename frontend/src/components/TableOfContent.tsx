

const TableOfContent = () => {

    const data = [
        {
        id: 15,
        name: '5 § Tarkemmat säännökset ja määräykset',
        content:  [{
            id: 11,
            name: 'Alaotsikko 1a',
            content: []
        }]
        },
        {
        id: 35,
        name: '5 § jotain',
        content:  [{
            id: 11,
            name: 'Alaotsikko 1b',
            content: []
        }]
        },
            
 
    ]

    const tocStyle: React.CSSProperties = {
        display: 'flow',
        position: 'fixed',
        width: '200px',
        top: '0pn',
        left: '0pn',
        border: '0px solid red',
    }

    return (
        <div key="tocdiv" style={tocStyle}>

    {data.map((section) => {


            return (<><h2 id={section.name}><a href={`#${encodeURIComponent(section.id)}`}>{section.name}</a></h2>
        

            {section.content.map((item) => {
            return (<h2 id={item.name}><a href={`#${encodeURIComponent(item.id)}`}>{item.name}</a></h2>)
            })} 
        </>
        )
    })} 
        </div>
    )
}

export default TableOfContent