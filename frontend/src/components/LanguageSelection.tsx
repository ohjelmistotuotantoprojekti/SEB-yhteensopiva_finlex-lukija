import { useEffect } from 'react'
import type {Lang} from "../types"

const LanguageSelection = ({language, setLanguage} : Lang) => {

    const menuStyle = {
    float: "right",
    }

    useEffect(() => {
        const langSelect = document.getElementById("lan")
        langSelect?.addEventListener("change", handleSelect)
        return () => {
        if (langSelect) {
            langSelect.removeEventListener("change", handleSelect)
            }
        
        }
        }, [])

    function handleSelect(event) {
        const currentValue = event.target.value
        setLanguage(currentValue)
        console.log(language)
    }

  return (
       <div className="dropdown" key="searchdiv" style={menuStyle}>
            <select data-placeholder="Choose a Language..." id="lan">
                <option value="fin">Suomi</option>
                <option value="swe">Ruotsi</option>
            </select>
      </div>
   )
}

export default LanguageSelection