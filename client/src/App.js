import { useEffect, useState } from 'react'
import Highlight from 'react-highlight'
import CodeEditor from '@uiw/react-textarea-code-editor'
import { useField } from './hooks/field'
import axios from 'axios'
import Login from './Login'
import './App.css';

const App = () => {
  const [user, setUser] = useState(null)
  const [users, setUsers] = useState(null)
  const name = useField('text')
  const [code, setCode] = useState('')
  const [codes, setCodes] = useState([])
 
  useEffect(() => {
    let userlist = null
    const get = async () => {
      if(user) {
        userlist = await getUsers(user)
        if(userlist) setUsers(userlist.data.users)
      }
    }
   get()
   // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  useEffect(() => {
   if(users) getCodes(user)
   // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users])

  const getUsers = async (user) => { 
    try {
      return await axios.get('/api/users', { headers: {Authorization: user.token}})
    } catch (e) {
      console.log(e)
    }
  }
  const getCodes = async (user) => { 
    try {
      const codeList = await axios.get(`/api/codes/${user.userId}`, 
      { headers: {Authorization: user.token}})
      let codeList2 = null
      if(users) codeList2 = await codeList.data.codes.map((c) => {
        if(c.owner !== user.userId) return {...c, sharedBy: users.find(u => u.id === c.owner).username }
        else {return c}
      })
     
      if(codeList2) setCodes(codeList2)
      else {setCodes(codeList.data.codes)}
    } catch (e) {
      console.log(e)
    }
  }
  const addCode = async (code) => {
    const date = new Date()
    try {
      await axios.post('/api/codes/add', 
      { code, 
        name: name.input.value, 
        id: user.userId,
        date: new Date(date.getTime()-date.getTimezoneOffset()*60*1000).toISOString() }, 
      { headers: {Authorization: user.token}})
    } catch (e) {
      console.log(e)
    }
    getCodes(user)
    setCode('')
    name.reset()
    console.log(codes)
  }

  const removeCode = async c => {
    try {
      //only code snippet creator can remove the code permanently
      if(c.owner === user.userId) await axios.get(`/api/codes/del/${c.id}`, 
        {headers: {Authorization: user.token}})
      else {
        await axios.post(`/api/codes/update/${c.id}`,
        { users: c.users.filter(u => u !== user.userId) },
        { headers: { Authorization: user.token } })
      }
      getCodes(user)
    } catch (e) {
      console.log(e)
    }
  }
  const setCollapsed = async (value,code) => {
    try {
      await axios.post(`/api/codes/update/${code.id}`,
      {...code, collapsed: value},
      { headers: {Authorization: user.token}})
      getCodes(user)
    } catch (e) {
      console.log(e)
    }
  }

  const handleLogout = () => {
    window.localStorage.removeItem('loggedCodeUser')
    setUsers(null)
    setUser(null)
  }
  
  const setDate = (date) => {
   if(date) return date.slice(0,10)+' '+date.slice(11,16)
  }

  const handleChange = async (code, userId) => {
    try {
      await axios.post(`/api/codes/update/${code.id}`,
      { users: code.users.concat(userId) },
      { headers: { Authorization: user.token } })
    } catch (e) {
      console.log(e)
    }
    alert('shared with '+users.find(u => u.id === userId).username)
  }

  return !user ? <Login setUser={setUser} /> :
    users && <div style={{marginLeft:'1em',marginRight:'1em'}}> 
      <h2>code snippet manager</h2>
      <div style={{position:'absolute',top:'1em',right:'1em'}} >
        {user.username}&#160;&#160;
        <button onClick={handleLogout}>logout</button>
      </div>
      <div className='Applikaatio'>
        <div style={{
          color:'white',
          paddingLeft:'1em', 
          borderRight:'solid 4px white'}}>
          <span style={{fontWeight:'700'}}>all users</span>
          <ul style={{paddingLeft:'1em',listStyleType:'none'}}>
          {users.map((u,i) => <li key={i}>{u.username}</li>)}
          </ul>
        </div>
        <div style={{padding:'0 .3em 0 .3em', color:'white'}}>
          <span style={{fontWeight:'700'}}>name</span>&#160;&#160;
          <input {...name.input} />
          <CodeEditor
              value={code}
              language="js"
              placeholder="Please enter JS code."
              onChange={(evn) => setCode(evn.target.value)}
              padding={15}
              style={{
                backgroundColor: "black",
                fontSize: '1em',
                fontFamily: 'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace',
              }}
          />
          <button style={{float:'right'}} onClick={() => addCode(code)}>save</button>
        </div>
      </div>
      {codes && codes.map(c => <div key={c.id}>
        <button onClick={() => removeCode(c)}>del</button>
        {c.collapsed ? <button onClick={() => setCollapsed(false,c)}>expand</button> :
        <button onClick={() => setCollapsed(true,c)}>collapse</button>}
        <span style={{
          border:'1px solid black', 
          padding:'0 .5em 0 .5em'}}>share&#160;&#160;
          <select onChange={(e) => handleChange(c,e.target.value)}>
            <option value="none" selected disabled hidden>select</option> 
            {users.filter(u => (u.id !== user.userId))
            .map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
          </select>
        </span>
        &#160;<span style={{
          border:'1px solid black', 
          padding:'0 .5em 0 .5em'}}>{setDate(c.date)}</span>&#160;&#160;{c.name}&#160;&#160;
        {c.sharedBy && <span style={{color:'blue'}}>(shared by {c.sharedBy})</span>}
        {!c.collapsed && <Highlight className='js'>{c.code}</Highlight>}
        </div>)}
     </div>
}

export default App;
