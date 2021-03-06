import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom'
import App from '../app'

const backgroundPageConnection = chrome.runtime.connect({
  name: '@formily-devtools-panel-script'
})

backgroundPageConnection.postMessage({
  name: 'init',
  tabId: chrome.devtools.inspectedWindow.tabId
})

const debounce = (fn: any, duration = 60) => {
  let timer = null
  return (...args: any[]) => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      clearTimeout(timer)
      fn(...args)
    }, duration)
  }
}

const Devtools = () => {
  const [state, setState] = useState([])
  useEffect(() => {
    let store = {}
    const update = debounce(() => {
      setState(
        Object.keys(store).map(key => {
          return store[key]
        })
      )
    })
    chrome.devtools.inspectedWindow.eval(
      'window.__FORMILY_DEV_TOOLS_HOOK__.update()'
    )
    backgroundPageConnection.onMessage.addListener(({ type, id, graph }) => {
      if (type == 'init') {
        store = {}
      } else if (type !== 'uninstall') {
        store[id] = JSON.parse(graph)
      } else {
        delete store[id]
      }
      update()
    })
  }, [])

  return <App dataSource={state} />
}

ReactDOM.render(<Devtools />, document.getElementById('root'))
