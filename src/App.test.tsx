/**
 * Top level application tests.
 */

import React from 'react'
import { render } from '@testing-library/react'

import App from './App'

describe('App', () => {
  test('matches snapshot', () => {
    const app = render(<App />)
    expect(app).toMatchSnapshot()
  })
})
