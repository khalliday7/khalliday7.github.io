/**
 * Define the SelfPortrait component.
 */

import React from 'react'
import { useSpring } from 'react-spring'

import Hair from './selfPortrait/Hair'
import Eyes from './selfPortrait/Eyes'
import Nose from './selfPortrait/Nose'
import Mouth from './selfPortrait/Mouth'
import Shirt from './selfPortrait/Shirt'

/**
 * Render my self portrait. This portrait should follow the mouse with its
 * eyes, and act surprised when its eye has been stolen.
 */
const Portrait = () => {
  const [surprised, setSurprised] = React.useState(false)
  const [{ mouseXY }, set] = useSpring(() => ({
    mouseXY: [0, 0],
  }))

  return (
    <div
      className="self-portrait"
      onMouseMove={({ clientX: x, clientY: y }) => set({ mouseXY: [x, y] })}
    >
      <div className="frame">
        <div className="head">
          <Hair />
          <Eyes
            lookTo={mouseXY}
            onEyeDragStart={() => setSurprised(true)}
            onEyeDragEnd={() => setSurprised(false)}
          />
          <Nose />
          <Mouth open={surprised} />
        </div>
        <Shirt />
      </div>
    </div>
  )
}

export default Portrait
