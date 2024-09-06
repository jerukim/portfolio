import * as React from 'react'
import { range } from 'lodash-es'

// on mouse move adjust path lines

const SVG_NAMESPACE = 'http://www.w3.org/2000/svg'
const GRID_SIZE = 20

type Axis = 'row' | 'col'
type Coordinate = { x: number; y: number }

type LineProps = Coordinate & { size: number; axis: Axis }
function Line({ x, y, size, axis }: LineProps) {
  const line = document.createElementNS(SVG_NAMESPACE, 'path')

  const end = {
    row: { x: size, y },
    col: { x, y: size },
  }

  line.setAttribute(
    'd',
    `M ${x} ${y} Q ${x},${y} ${end[axis].x},${end[axis].y}`
  )
  line.setAttribute('class', axis)

  return line
}

function calcGridFromRect({ width, height }: DOMRect) {
  return {
    rows: Math.ceil(height / GRID_SIZE),
    cols: Math.ceil(width / GRID_SIZE),
  }
}

export function GraphMouseWarp() {
  const containerRef = React.useRef<SVGSVGElement>(null)
  const observer = React.useRef<ResizeObserver>()

  function drawGrid(rect: DOMRect) {
    const { rows, cols } = calcGridFromRect(rect)

    // draw rows
    for (const row of range(0, rows)) {
      const y = row * GRID_SIZE
      const line = Line({
        x: 0,
        y,
        size: rect.width,
        axis: 'row',
      })
      containerRef.current?.appendChild(line)
    }

    // draw cols
    for (const col of range(0, cols)) {
      const x = col * GRID_SIZE
      const line = Line({
        x,
        y: 0,
        size: rect.height,
        axis: 'col',
      })
      containerRef.current?.appendChild(line)
    }
  }

  React.useLayoutEffect(() => {
    if (containerRef.current) {
      // Draw initial grid lines
      drawGrid(containerRef.current.getBoundingClientRect())

      // Redraw grid lines on container resize
      observer.current = new ResizeObserver((entries) => {
        for (const entry of entries) {
          drawGrid(entry.contentRect)
        }
      })
      observer.current.observe(containerRef.current)

      return () => {
        containerRef.current?.replaceChildren()
        observer.current?.disconnect()
      }
    }
  }, [])

  return (
    <svg
      xmlns={SVG_NAMESPACE}
      ref={containerRef}
      className="w-screen h-screen bg-gray-100 stroke-blue-300"
    />
  )
}
