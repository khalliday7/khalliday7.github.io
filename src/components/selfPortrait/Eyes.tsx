/**
 * Define self portrait Eyes component.
 */

import React from 'react'
import { animated, OpaqueInterpolation } from 'react-spring'

import useDragSpring from 'hooks/useDragSpring'
import { classNames } from 'utils/styles'

type Coords = number[]
type AnimatedCoords = OpaqueInterpolation<Coords>

interface EyeProps {
  lookTo: AnimatedCoords
  onEyeDragStart: () => void
  onEyeDragEnd: () => void
}

interface EyesProps extends EyeProps {}

const lookToTransform = (x: number, y: number) =>
  `translate3d(calc(${x / 100}px - 50%),calc(${y / 100}px - 50%),0)`

/**
 * Defines a single, draggable eye.
 */
const Eye = ({ lookTo, onEyeDragStart, onEyeDragEnd }: EyeProps) => {
  const { bindContainer, bindDraggable, dragging } = useDragSpring({
    controlContainerDimensions: false,
    controlDraggableDimensions: true,
    onDragStart: onEyeDragStart,
    onDragEnd: onEyeDragEnd,
  })
  const { ref: containerRef, ...containerBinds } = bindContainer()
  const lookToFromCenter = (x: number, y: number) => {
    const el = containerRef.current
    if (el) {
      const rect = el.getBoundingClientRect()
      const centerX = rect.left + el.offsetWidth / 2
      const centerY = rect.top + el.offsetHeight / 2
      return lookToTransform(x - centerX, y - centerY)
    } else {
      return lookToTransform(0, 0)
    }
  }
  // @ts-ignore react spring interpolation types do not match usage requirments
  const transform = lookTo.interpolate(lookToFromCenter)

  return (
    <div
      ref={containerRef}
      {...containerBinds}
      className={classNames('eye', dragging && 'dragging')}
    >
      <div className="brow" />
      <animated.div {...bindDraggable()} className="white">
        <animated.div className="iris" style={{ transform }}>
          <animated.div className="pupil" style={{ transform }} />
        </animated.div>
      </animated.div>
    </div>
  )
}

/**
 * Render both eyes, looking at the given coordinates. Eye drag start
 * and drag end handlers are attached to both eye components.
 */
const Eyes = (props: EyesProps) => (
  <div className="eyes">
    <Eye {...props} />
    <Eye {...props} />
  </div>
)

export default Eyes
