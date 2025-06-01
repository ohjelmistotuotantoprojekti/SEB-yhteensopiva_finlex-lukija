

const TableOfContent = () => {

    const data = [{'1 § Toimiala ja hallinnollinen asema': ['Alaotsikko 1a', 'alaotsikko 2a']},
  {'Ylätason otskko 2': ['Alaotsikko 1b', '7 § Siirtymäsäännökset']},
]

    const tocStyle: React.CSSProperties = {
        display: 'block',
        position: 'fixed',
        width: '250px',
        top: '0pn',
        left: '0pn',
        border: '0px solid red',
    }

    return (
        <div key="tocdiv" style={tocStyle}>

    {data.map((section) => {
            const title: string = Object.keys(section)[0]
           
            return (<>
            <h2 id={title}><a href={`#:~:text=${encodeURIComponent(title)}`}>{title}</a></h2>
            
            {Object.values(section).map((item)=>  <p id={item}><a href={`#:~:text=${encodeURIComponent(item)}`}>{item}</a></p> )}

               
            </>
        )
    })}
        
        </div>
    )
}

export default TableOfContent