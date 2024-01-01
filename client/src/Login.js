import { useEffect, useState, useReducer } from 'react'
import axios from 'axios'
import { useField } from './hooks/field'
import './App.css';

const initial = { 
  login: { display: ''}, 
  signup: { display:'none' } 
}
const reducer = state => state.login.display === '' ? 
{ login: { display: 'none'}, signup: { display:'' } } :
{ login: { display: ''}, signup: { display:'none' } }

const Login = (props) => {
  const [style, toggle] = useReducer(reducer, initial)
  const [error, setError] = useState(null)
  const username = useField('text')
  const password = useField('password')
  const baseUrl = '/api/users'

  //this prevent logout when browser refreshes
  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedCodeUser')
    if (loggedUserJSON) {
      try {
        props.setUser(JSON.parse(loggedUserJSON))
      } catch (e) { console.log(e.name) }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    setTimeout(() => {
      setError(null)
    },5000)
  },[error])

  const handleSignUp = async () => {
    try {
      const response = await axios.post(`${baseUrl}/signup`, {username: username.input.value, password: password.input.value})
      if(response.data.error) setError(response.data.error)
    } catch (exception) {
      console.log(exception)
    }
    toggle(style)
  }

  const handleLogin = async () => {
    let newLogin = null
    try {
      newLogin = await axios.post(`${baseUrl}/login`, {username: username.input.value, password: password.input.value})
      if(newLogin.data.error) {
        setError(newLogin.data.error)
        return
      }
      props.setUser(newLogin.data)
      window.localStorage.setItem(
        'loggedCodeUser', JSON.stringify(newLogin.data)
      )
    } catch (exception) {
      console.log(exception)
    }
  }
  
  return <div className="App">
      <div style={style.login}>
        <h1>
            Login
        </h1> 
        <div style={{border:'1px solid black',padding:'1em',width:'fit-content',display:'inline-block'}}>
          <div>username&#160;&#160;
            <input {...username.input} />
          </div>
          <div>password&#160;&#160;
            <input {...password.input} />
          </div>
          <button onClick={handleLogin}>login</button>
        <button onClick={() => toggle(style)}>sign up</button>
        </div>
      </div>
      <div style={style.signup}>
        <h1>
            Sign Up
        </h1>
        <div style={{border:'1px solid black',padding:'1em',width:'fit-content',display:'inline-block'}}>
          <div>username&#160;&#160;
            <input {...username.input} />
          </div>
          <div>password&#160;&#160;
            <input {...password.input} />
          </div>
          <button onClick={handleSignUp}>sign up</button>
          <button onClick={() => toggle(style)}>cancel</button>
        </div>
      </div>
      { error && <div style={{fontSize:'1.5em', color:'red', fontWeight:'900'}}>{error}</div> }
    </div>
}

export default Login;