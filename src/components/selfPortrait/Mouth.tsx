/**
 * Define the self portrait Mouth component.
 */

import React from 'react'
import { useSpring, animated } from 'react-spring'

interface Props {
  open: boolean
}

/**
 * Renders my mouth, optionally open.
 * Technically its always open, but open === true REALLY opens it.
 */
const Mouth = ({ open }: Props) => {
  const mouthStyle = useSpring({
    bottom: open ? '0%' : '10%',
    height: open ? '20%' : '10%',
    borderRadius: open ? '100% 100% 100% 100%' : '0% 0% 100% 100%',
  })

  return (
    <animated.div style={mouthStyle} className="mouth">
      <div className="teeth" />
      <div className="tongue" />
    </animated.div>
  )
}

export default Mouth
