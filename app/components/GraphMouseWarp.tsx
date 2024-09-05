import * as React from 'react'
import { range } from 'lodash-es'

const SVG_NAMESPACE = 'http://www.w3.org/2000/svg'
const GRID_SIZE = 20

function Line({
  x,
  y,
  width,
  height,
}: {
  x: number
  y: number
  width: number
  height: number
}) {
  const line = document.createElementNS(SVG_NAMESPACE, 'path')
  line.setAttribute('d', `M ${x} ${y} Q ${x},${y} ${width},${height}`)

  return line
}

export function GraphMouseWarp() {
  const containerRef = React.useRef<SVGSVGElement>(null)

  // on mount draw initial lines
  React.useLayoutEffect(() => {
    if (containerRef.current) {
      const { width, height } =
        containerRef.current?.getBoundingClientRect()

      // Append horizontal lines
      const rows = Math.ceil(height / GRID_SIZE)
      for (const row of range(0, rows)) {
        const y = row * GRID_SIZE
        const line = Line({ x: 0, y, width, height: y })
        containerRef.current.appendChild(line)
      }

      // Append vertical lines
      const cols = Math.ceil(width / GRID_SIZE)
      for (const col of range(0, cols)) {
        const x = col * GRID_SIZE
        const line = Line({ x, y: 0, width: x, height })
        containerRef.current.appendChild(line)
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
