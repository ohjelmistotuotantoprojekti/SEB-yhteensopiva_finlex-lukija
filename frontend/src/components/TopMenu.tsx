
const TopMenu = () => {

    const menyStyle: React.CSSProperties = {
        color: '#fefefe',
        textDecoration: 'none',
    }
    const menuDivStle: React.CSSProperties = {
        display: 'flex',
    justifyContent: 'space-evenly',
        marginTop: '0px',
        width: '400px',
        border: '0px solid pink',
        paddingTop: '14px'
    }

  return (
      <div id="topmenudiv" style={menuDivStle} ><a style={menyStyle} href="/lainsaadanto/">Lainsäädäntö</a>
   &nbsp; <a style={menyStyle} href="/oikeuskaytanto/">Oikeuskäytäntö</a>
   </div>
   )
}

export default TopMenu