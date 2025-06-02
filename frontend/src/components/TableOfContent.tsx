
import type {Headings } from "../types"


const TableOfContent = ({headings}: {headings: Headings[]}) => {
    
    const data = headings 

    const tocStyle: React.CSSProperties = {
        display: 'flow',
        position: 'fixed',
        width: '250px',
        top: '0pn',
        left: '0pn',
        border: '0px solid red',
    }

    return (
        <div key="tocdiv" style={tocStyle}>

    {data.map((section) => {


            return (<><div id={section.name}><a href={`#${section.id}`}>{section.name}</a></div>
        

            {section.content.map((item) => {
            return (<div id={item.name}><a href={`#${item.id}`}>{item.name}</a></div>)
            })} 
        </>
        )
    })} 
        </div>
    )
}

export default TableOfContent