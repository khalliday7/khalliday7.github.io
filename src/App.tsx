/**
 * Define top level App component.
 */

import React from 'react'
import { hot } from 'react-hot-loader/root'
import { Switch, BrowserRouter as Router, Route } from 'react-router-dom'

import Home from 'pages/Home'

const App = () => (
  <Router>
    <Switch>
      <Route path="/">
        <Home />
      </Route>
    </Switch>
  </Router>
)

export default hot(App)
