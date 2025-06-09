
const TopMenu = () => {

    const menyStyle: React.CSSProperties = {
        color: '#fefefe',
        textDecoration: 'none',
    }

    const menyActiveStyle: React.CSSProperties = {
        color: '#fefefe',
        textDecoration: 'underline',
    }

    const menuDivStle: React.CSSProperties = {
        display: 'flex',
    justifyContent: 'space-evenly',
        marginTop: '0px',
        width: '400px',
        border: '0px solid pink',
        paddingTop: '14px'
    }
    const path: string = window.location.pathname

  return (
      <div id="topmenudiv" style={menuDivStle} ><a style={(path ==="/lainsaadanto/") ? menyActiveStyle:  menyStyle} href="/lainsaadanto/">Lainsäädäntö</a>
   &nbsp; <a style={(path ==="/oikeuskaytanto/") ? menyActiveStyle:  menyStyle} href="/oikeuskaytanto/">Oikeuskäytäntö</a>
   </div>
   )
}

export default TopMenu