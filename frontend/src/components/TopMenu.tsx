import LanguageSelection from "./LanguageSelection"
import type { TopMenuProps } from "../types"


const TopMenu = ({language, handleSelect}: TopMenuProps) => {

  const menyStyle: React.CSSProperties = {
    color: '#fefefe',
    textDecoration: 'none',
    border: 0,
  }

  const menyActiveStyle: React.CSSProperties = {
    color: 'black',
    textDecoration: 'none',
  }

  const menuDivStle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-evenly',
    marginTop: '0px',
    width: '500px',
    border: '0px solid pink',
    paddingBottom: '0px',
  }

  const secdivStyle: React.CSSProperties = {
    border: '0px solid pink',
    padding: 0,
    paddingTop: '14px',
    margin: 0,
  }

  const secdivActiveStyle: React.CSSProperties = {
    border: '0px solid pink',
    borderTop: '1px solid #0C6FC0',
    backgroundColor: "#F3F8FC",
    padding: 10,
    paddingTop: '14px',
  }

  const path: string = window.location.pathname
  const lawpage: boolean = path.startsWith("/lainsaadanto")

  return (
    <div id="topmenudiv" style={menuDivStle} >
      <div id="lainsdiv" style={lawpage ? secdivActiveStyle :  secdivStyle}>
        <a style={lawpage ? menyActiveStyle :  menyStyle} href="/lainsaadanto/">{(language === "fin") ? "Lainsäädäntö" : "Lagstiftning"}</a>
      </div>
      <div id="oikkaytdiv" style={!lawpage ? secdivActiveStyle :  secdivStyle}>
        <a style={!lawpage ? menyActiveStyle :  menyStyle} href="/oikeuskaytanto/">{(language === "fin") ? "Oikeuskäytäntö" : "Rättspraxis"}</a>
      </div>
      <LanguageSelection language={language} handleSelect={handleSelect}/>
    </div>
  )
}

export default TopMenu
