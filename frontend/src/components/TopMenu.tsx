
const TopMenu = () => {

    const menyStyle: React.CSSProperties = {
        color: '#fefefe',
        textDecoration: 'none',
        padding: '20px',
        
    }

  return (
      <div id="topmenydiv" ><a style={menyStyle} href="/">Lainsäädäntö</a>
   &nbsp; <a style={menyStyle} href="/oikeuskaytantohaku/">Oikeuskäytäntö</a>
   </div>
   )
}

export default TopMenu