//import { useEffect } from 'react'
import type {Lang} from "../types"

const LanguageSelection = ({language, setLanguage} : Lang) => {

    const menuStyle = {
        border: 0, 
        marginRight: '10px',
        marginTop: '11px',
    }

    /*useEffect(() => {
        const langSelect = document.getElementById("lan")
        langSelect?.addEventListener("change", handleSelect)
        return () => {
        if (langSelect) {
            langSelect.removeEventListener("change", handleSelect)
            }
        
        }
        }, []) */

    function handleSelect(event: React.SyntheticEvent) {
        const currentValue = (event.target as HTMLInputElement).value
        setLanguage(currentValue)
        localStorage.setItem("language", currentValue)
        console.log(currentValue)
    }

  return (
       <div key="searchdiv" style={menuStyle}>
            <select 
            data-placeholder="Choose a Language..." 
            id="lan"
            value={language}
            onChange={handleSelect}
            >

                <option value="fin">Suomi</option>
                <option value="swe">Ruotsi</option>
            </select>
      </div>
   )
}

export default LanguageSelection