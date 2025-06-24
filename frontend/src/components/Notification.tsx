
const Notification = ({message}: {message: string}) => {

  const errorStyle: React.CSSProperties = {
    width: '620px',
    backgroundColor: '#ffffff',
    border: '0 pxsolid #0C6FC0',
    padding: '10px',
  }

  if (message === "") {
    return null
  }
  return (
    <>
      <div id="error" style={errorStyle}>
        {message}
      </div>
    </>
  )
}

export default Notification
