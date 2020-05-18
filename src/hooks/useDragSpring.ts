/**
 * Define the useDragSpring hook.
 */

import React from 'react'
import PropTypes from 'prop-types'
import { animated, useSpring, config, SpringConfig } from 'react-spring'
import { useDrag } from 'react-use-gesture'
import { FullGestureState } from 'react-use-gesture/dist/types'
import { isNonNull } from 'utils/types'

/**************************************************
 * Types
/**************************************************/

type RequiredDragStateFields = 'initial' | 'xy' | 'down' | 'first' | 'last'
type FullDragState = FullGestureState<'drag'>
type DragState = Partial<FullDragState> &
  Pick<FullDragState, RequiredDragStateFields>

interface Offset {
  top: number
  left: number
}

type SetOffset = (offset?: Offset) => void

type OffsetRef = React.MutableRefObject<Offset | undefined>

type ContainerRef = React.RefObject<HTMLDivElement>
type DraggableRef = React.RefObject<HTMLDivElement>

type SpringStyle = React.CSSProperties & {
  config?: SpringConfig
  immediate?: boolean
  onRest?: () => void
}

type SetSpringStyle = (style: SpringStyle) => void

type AnimatedDivProps = PropTypes.InferProps<typeof animated.div> & {
  ref: React.RefObject<HTMLDivElement>
}

interface DragSpringContext {
  fixed: boolean
  setFixed: (fixed: boolean) => void
  springStyle: SpringStyle
  setSpringStyle: SetSpringStyle
  mouseOffsetRef: OffsetRef
  setMouseOffset: SetOffset
  containerRef: ContainerRef
  dragState: DragState
}

interface UseDragSpringInterface {
  bindContainer: () => AnimatedDivProps
  bindDraggable: () => AnimatedDivProps
  dragging: boolean
  pause: () => void
  unpause: () => void
  reset: () => void
  hide: () => void
}

interface UseDragSpringParams {
  onClick?: () => void
  onDragStart?: (dragState: DragState) => void
  onDragEnd?: (dragState: DragState) => void
  controlContainerDimensions?: boolean
  controlDraggableDimensions?: boolean
}

/**************************************************
 * DOM
 * ---
 *
 * Handle DOM updates in reaction to the current DragSpringContext.
 *
 * Updates include:
 *  - Disabling text highlight when dragging begins.
/**************************************************/

const setDocumentTextSelectability = (selectable: boolean) => {
  const rootClassList = document.getElementById('root')?.classList
  if (rootClassList) {
    if (selectable) {
      rootClassList.remove('unselectable')
    } else {
      rootClassList.add('unselectable')
    }
  }
}

const handleDocumentUpdates = ({ dragState }: DragSpringContext) => {
  const { first, last } = dragState
  if (first) {
    setDocumentTextSelectability(false)
  } else if (last) {
    setDocumentTextSelectability(true)
  }
}

/**************************************************
 * Mouse Offset
 * ------------
 *
 * Handle MouseOffetRef updates in reaction to the current DragSpringContext.
 * The mouse offset ref remembers the initial position of the mouse, relative
 * to the dragged element. It is used to mantain that initial offet when
 * updating the dragged element's position.
/**************************************************/

const handleMouseOffsetUpdates = ({
  containerRef,
  dragState,
  setMouseOffset,
}: DragSpringContext) => {
  const containerDiv = containerRef?.current

  if (!isNonNull<HTMLElement>(containerDiv)) {
    return
  }

  const {
    first,
    initial: [ix, iy],
  } = dragState

  if (first) {
    const box = containerDiv.getBoundingClientRect()
    setMouseOffset({
      top: iy - box.top,
      left: ix - box.left,
    })
  }
}

/**************************************************
 * Style
 * -----
 *
 * Handle updates to the style of the dragged element in reaction to the
 * current DragSpringContext.
 *
 * Updates include:
 *  - scale the element down to 50% during drag
 *  - fade the element to 50% opacity during drag
/**************************************************/

const getInitialStyle = () => ({
  opacity: 1,
  transform: 'scale(1)',
})

const handleStyleUpdates = ({
  setSpringStyle,
  dragState,
}: DragSpringContext) => {
  const { first, last } = dragState
  if (first) {
    // setSpringStyle({ opacity: 0.5, transform: 'scale(0.5)', immediate: false })
  } else if (last) {
    // setSpringStyle({ ...getInitialStyle(), immediate: false })
  }
}

/**
 * These styles are not dependent on DragSpringContext, and are derived from
 * the current value of `fixed`. They are styles that we do not animate.
 */
const fixedToStyles = (
  fixed: boolean,
  controlDimensions: boolean,
  draggableRef: DraggableRef,
) => {
  const draggableDiv = draggableRef.current
  let width
  let height

  if (fixed && controlDimensions && isNonNull<HTMLDivElement>(draggableDiv)) {
    width = draggableDiv.offsetWidth
    height = draggableDiv.offsetHeight
  }

  return {
    width,
    height,
    pointerEvents: fixed ? 'none' : undefined,
    zIndex: fixed ? 10 : 0,
    position: fixed ? 'fixed' : undefined,
  }
}

/**************************************************
 * Position Handlers
 * -----------------
 *
 * Update the position of the dragged element in reaction to the current
 * DragSpringContext. Position updates are made ST the offset of the mouse and
 * the dragged element stays constant.
 *
 * These reactions implement the following steps:
 *  - when drag begins, fix the dragged element, and immediately update its
 *    position (which is now relative to the viewport) ST it does not visually
 *    move
 *  - as the mouse moves, move the element with it
 *  - when drag ends, move the element back to its initial position
 *  - when the element is back at its intial position, un fix it's position
/**************************************************/

const getInitialPosition = () => ({
  top: 0,
  left: 0,
})

const handlePositionUpdates = ({
  setFixed,
  setSpringStyle,
  dragState,
  containerRef,
  mouseOffsetRef,
}: DragSpringContext) => {
  const {
    down,
    first,
    xy: [x, y],
  } = dragState
  const containerDiv = containerRef?.current
  const mouseOffset = mouseOffsetRef?.current

  if (
    !isNonNull<HTMLDivElement>(containerDiv) ||
    !isNonNull<Offset>(mouseOffset)
  ) {
    return
  }

  const begin = () => {
    setFixed(true)
    setSpringStyle({
      top: y - mouseOffset.top,
      left: x - mouseOffset.left,
      immediate: true,
    })
  }

  const drag = () => {
    setSpringStyle({
      top: y - mouseOffset.top,
      left: x - mouseOffset.left,
      immediate: false,
      onRest: undefined,
    })
  }

  const reset = () => {
    const box = containerDiv.getBoundingClientRect()
    setSpringStyle({
      top: box.top,
      left: box.left,
      onRest: () => {
        setFixed(false)
        setSpringStyle({ top: 0, left: 0, immediate: true, onRest: undefined })
      },
    })
  }

  if (first) {
    begin()
  } else if (down) {
    drag()
  } else {
    reset()
  }
}

/**
 * Hook that provides binding functions, to be applied on an draggable element,
 * and its (required) container. The draggable element must be an
 * `animated.div` from react.spring.
 */
const useDragSpring = ({
  onClick,
  onDragStart,
  onDragEnd,
  controlContainerDimensions,
  controlDraggableDimensions,
}: UseDragSpringParams = {}): UseDragSpringInterface => {
  const draggableRef = React.useRef<HTMLDivElement>(null)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [containerStyles, setContainerStyles] = React.useState<
    React.CSSProperties
  >({})

  // no initial value, to allow mutations on ref.current
  const mouseOffsetRef = React.useRef<Offset>()
  const setMouseOffset = (offset?: Offset) => {
    mouseOffsetRef.current = offset
  }

  /**
   * We use a ref to pause/unpause the draggable div ST the pause can happen
   * while a drag event is being handled.
   */
  const pausedRef = React.useRef<boolean>(false)
  const setPaused = (paused: boolean) => {
    pausedRef.current = paused
  }
  const pause = () => setPaused(true)
  const unpause = () => setPaused(false)

  const [fixed, setFixed] = React.useState<boolean>(false)
  const [springStyle, setSpringStyle] = useSpring(() => ({
    ...getInitialPosition(),
    ...getInitialStyle(),
    config: {
      ...config.stiff,
      clamp: true,
    },
  }))

  const bindUseDrag = useDrag((dragState) => {
    const dragSpringContext: DragSpringContext = {
      fixed,
      setFixed,
      springStyle,
      setSpringStyle,
      mouseOffsetRef,
      setMouseOffset,
      containerRef,
      dragState,
    }

    const { first, last, elapsedTime } = dragState
    first && onDragStart && onDragStart(dragState)
    last && onDragEnd && onDragEnd(dragState)
    last && elapsedTime < 100 && onClick && onClick()

    if (pausedRef.current) {
      return
    }

    handleDocumentUpdates(dragSpringContext)
    handleMouseOffsetUpdates(dragSpringContext)
    handleStyleUpdates(dragSpringContext)
    handlePositionUpdates(dragSpringContext)
  })

  /**
   * Ensure container div takes the width of it's child. This ensures document
   * structure is held while the child is being dragged. It also allows us to
   * accurately calcuate the return position when the child is dropped.
   *
   * NOTE: React.useEffect runs after paint, so this width and height update
   * may cause some repositiong of divs depending on the context. If we notice
   * this is an issue, we may consider switching to React.useLayoutEffect,
   * which runs before paint. See https://reactjs.org/docs/hooks-reference.html#uselayouteffect.
   */
  React.useEffect(() => {
    const containerDiv = containerRef.current
    const draggableDiv = draggableRef.current

    if (
      controlContainerDimensions &&
      isNonNull<HTMLDivElement>(containerDiv) &&
      isNonNull<HTMLDivElement>(draggableDiv)
    ) {
      const width = draggableDiv.offsetWidth
      const height = draggableDiv.offsetHeight
      setContainerStyles({ width, height })
    }
  }, [controlContainerDimensions, setContainerStyles])

  const bindContainer = () => ({
    ref: containerRef,
    style: containerStyles,
  })

  const bindDraggable = () => ({
    ...bindUseDrag(),
    ref: draggableRef,
    /**
     * Most browsers implement some default onDrag, so we must prevent that
     * default. The is necessary because bindUseDrag only sets onMouseDown and
     * onTouchStart handlers.
     */
    onDragStart: (e: MouseEvent) => e.preventDefault(),
    style: {
      ...fixedToStyles(
        fixed,
        Boolean(controlDraggableDimensions),
        draggableRef,
      ),
      ...springStyle,
    },
  })

  /**
   * Resets the draggable div to it's original position. We do this by
   * providing a semi-mocket dragState, with last === true. This relies on the
   * current implementation of the dragSpringContext handlers. If the logic of
   * these handlers is changed, this may no longer suffice.
   */
  const reset = () => {
    const dragSpringContext: DragSpringContext = {
      fixed,
      setFixed,
      springStyle,
      setSpringStyle,
      mouseOffsetRef,
      setMouseOffset,
      containerRef,
      dragState: {
        first: false,
        down: false,
        last: true,
        xy: [0, 0],
        initial: [0, 0],
      },
    }
    handlePositionUpdates(dragSpringContext)
    handleDocumentUpdates(dragSpringContext)
    handleMouseOffsetUpdates(dragSpringContext)
    handleStyleUpdates(dragSpringContext)
    handlePositionUpdates(dragSpringContext)
    setPaused(false)
  }

  /**
   * Scale the element all the way down. No unhide complement is needed yet,
   * but if it is, it may need to scale up to 0.5, or 1, depending on the
   * dragSpringContext.
   */
  const hide = () => {
    setSpringStyle({ transform: 'scale(0)', immediate: false })
  }

  return {
    bindContainer,
    bindDraggable,
    dragging: fixed,
    pause,
    unpause,
    hide,
    reset,
  }
}

export default useDragSpring
