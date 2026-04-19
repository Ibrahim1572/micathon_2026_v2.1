import { useState } from 'react'
import ScreenA from './components/ScreenA'
import ScreenD from './components/ScreenD'
import ScreenF from './components/ScreenF'

/*
  App.jsx — top-level screen router and global state.
  State flows DOWN via props; updates flow UP via callback props.
  No arrow functions. No Context/Redux/Zustand.
*/

function App() {
  /* ── Global shared state ── */
  var [screen,           setScreen]           = useState('A')
  var [parsedCategories, setParsedCategories] = useState(null)
  var [substitutions,    setSubstitutions]    = useState([])
  var [finalSubs,        setFinalSubs]        = useState([])

  /* ── Screen A → Screen D transition ── */
  function handleScreenAProceed(subs, cats) {
    setSubstitutions(subs)
    setParsedCategories(cats)
    setScreen('D')
  }

  /* ── Screen D → Screen F transition (Phase 3) ── */
  function handleScreenDProceed(acceptedSubs) {
    setFinalSubs(acceptedSubs)
    setScreen('F')
  }

  /* ── Screen F → Screen A transition (Reset) ── */
  function handleRestart() {
    setScreen('A')
    setParsedCategories(null)
    setSubstitutions([])
    setFinalSubs([])
  }

  return (
    <div id="app-root">

      {screen === 'A' && (
        <ScreenA onProceed={handleScreenAProceed} />
      )}

      {screen === 'D' && (
        <ScreenD 
          substitutions={substitutions} 
          onProceed={handleScreenDProceed} 
        />
      )}

      {screen === 'F' && (
        <ScreenF 
          finalSubs={finalSubs}
          onRestart={handleRestart}
        />
      )}

    </div>
  )
}

export default App

