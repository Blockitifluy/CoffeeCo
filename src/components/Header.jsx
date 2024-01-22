import logo from "../logo.png"

function Header(props) {
  return (
    <header class={props.styles.header}>
      <div>
        <img src={logo}/>
        <h1>CoffeeCo</h1>
      </div>
      <input placeholder='Search CoffeeCo'/>

      <div>
        <button class={props.styles.notification_button}></button>
        <button class={props.styles.post_button}></button>
      </div>
    </header>
  )
}

export default Header;