interface Law {
  id: string,
  name: string
}


import axios from 'axios'


const App = () => {

  const laws: Law[] = [
    {
      id: "1",
      name: "law about averages",
    },
    {
      id: "2",
      name: "law about bananas",
    },
    {
      id: "3",
      name: "law about something",
    },
  ]



 

  /**  Hakee backendiltä dataa
  const getJson = async () => {
    const url: string = 'http://localhost:3001/notes'
    await axios.get(url).then(response => {
        console.log(response.data)
    })
  }
  */


  return (
    <div>
    <h3>Tässä on lait:</h3>
    <ul>
    {laws.map((law) =><li key={law.id}>{law.name}</li>) }
    </ul>
    </div>
  )
}

export default App
