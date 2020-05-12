/**
 * The entrypoint to the application
 */
import React from 'react'
import { render } from 'react-dom'

import App from './App'

const rootElement = document.getElementById('root')

if (rootElement != null) {
  render(<App />, rootElement)
} else {
  console.error('No root element found. Aborting.')
}
