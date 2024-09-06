import * as React from 'react'

type Axis = 'row' | 'col'

const SVG_NAMESPACE = 'http://www.w3.org/2000/svg'
const WARP_OFFSETS = [0.05, 0.1, 0.1, 0.1, 0.05]
const PATH_ROW_INDEXES = [5, 7, 10, 12, 15, 17, 20, 22, 25, 27]
const PATH_COL_INDEXES = [4, 6, 9, 11, 14, 16, 19, 21, 24, 26]

const PATH = [
  // Cursor Start
  'M',
  0, // x - 1
  0, // y - 2
  // Flat Path Start
  'Q',
  0, // x - 4
  0,
  0, // x - 6
  0,
  // Arc Start
  'Q', // 8
  0, // x - 9
  0, // y - 10
  0, // x - 11
  0,
  // Arc Peak
  'Q',
  0, // x - 14
  0,
  0, // x - 16
  0,
  // Arc End
  'Q',
  0, // x - 19
  0,
  0, // x - 21
  0,
  // Flat Path
  'Q',
  0, // x - 24
  0,
  0, // x - 26
  0,
  // Cursor End
  'T',
  0, // x - 29
  0, // y - 30
]

type LineProps = {
  axis: Axis
  position: number
  length: number
}
class Line {
  public node: SVGPathElement
  public axis: Axis
  public position: number
  public length: number

  private pathStartIndex: 1 | 2
  private pathEndIndex: 29 | 30
  private pathLengthIndex: 29 | 30
  private arcStartIndex: 9 | 10
  private pathPointIndexes: number[]
  private warpPointIndexes: number[]
  private arcPointIndexes: number[]

  constructor({ axis, position, length }: LineProps) {
    this.axis = axis
    this.position = position
    this.length = length

    switch (axis) {
      case 'row':
        this.pathStartIndex = 2
        this.pathEndIndex = 30
        this.pathLengthIndex = 29
        this.arcStartIndex = 9
        this.pathPointIndexes = PATH_ROW_INDEXES
        this.warpPointIndexes = PATH_COL_INDEXES
        this.arcPointIndexes = [12, 15, 17, 20, 22]
        break
      case 'col':
        this.pathStartIndex = 1
        this.pathEndIndex = 29
        this.pathLengthIndex = 30
        this.arcStartIndex = 10
        this.pathPointIndexes = PATH_COL_INDEXES
        this.warpPointIndexes = PATH_ROW_INDEXES
        this.arcPointIndexes = [11, 14, 16, 19, 21]
        break
    }

    this.node = document.createElementNS(SVG_NAMESPACE, 'path')
    this.flatten()
  }

  public warp(max: number, m: number, n: number) {
    const pathArr = (this.node.getAttribute('d') as string).split(' ')
    // const arcStartPosition = parseFloat(pathArr[this.arcStartIndex])

    if (Math.abs(this.position - m) < max) {
      void (m < this.position && (max *= -1))

      // update arch points
      const diff = max + (this.position - m)
      for (const i in this.arcPointIndexes) {
        pathArr[this.arcPointIndexes[i]] = (
          this.position -
          diff * WARP_OFFSETS[i]
        ).toString()
      }
    }
    // else if (this.position !== arcStartPosition) {
    //   // update old arcs out of range to straight
    //   for (const index of this.arcPointIndexes) {
    //     pathArr[index] = this.position.toString()
    //   }
    // }

    // center opposite axi points
    for (let i = 0; i < this.warpPointIndexes.length; i++) {
      pathArr[this.warpPointIndexes[i]] = (
        n +
        (-100 + i * 20)
      ).toString()
    }

    this.node.setAttribute('d', pathArr.join(' '))
  }

  public unwarp() {
    this.flatten()
  }

  private flatten() {
    const path = [...PATH]

    path[this.pathStartIndex] = this.position
    this.pathPointIndexes.forEach((i) => (path[i] = this.position))
    path[this.pathEndIndex] = this.position
    path[this.pathLengthIndex] = this.length

    this.node.setAttribute('d', path.join(' '))
  }
}

type GridOptions = {
  gap: number
  mass: number
}
class Grid {
  private node: SVGSVGElement
  private observer = new ResizeObserver((entries) => {
    for (const entry of entries) {
      this.clear()
      this.build(entry.contentRect)
    }
  })
  private gap: number
  private mass: number
  private warpIndexOffset: number
  private rows: Line[] = []
  private cols: Line[] = []

  constructor(
    node: SVGSVGElement,
    { gap = 20, mass = 100 }: GridOptions = { gap: 20, mass: 100 }
  ) {
    this.node = node
    this.gap = gap
    this.mass = mass
    this.warpIndexOffset = this.mass / this.gap
    this.observer.observe(node)
  }

  private build(parentRect: DOMRect) {
    for (let y = 0; y < parentRect.height; y += this.gap) {
      const line = new Line({
        axis: 'row',
        position: y,
        length: parentRect.width,
      })
      this.node.appendChild(line.node)
      this.rows.push(line)
    }

    for (let x = 0; x < parentRect.width; x += this.gap) {
      const line = new Line({
        axis: 'col',
        position: x,
        length: parentRect.height,
      })
      this.node.appendChild(line.node)
      this.cols.push(line)
    }
  }

  private clear() {
    this.node.replaceChildren()
    this.rows = []
    this.cols = []
  }

  public warp(x: number, y: number) {
    const rowIndex = y / this.gap
    const rowStartIndex = Math.floor(rowIndex - this.warpIndexOffset)
    const rowEndIndex = Math.ceil(rowIndex + this.warpIndexOffset) + 1
    this.rows
      // .slice(
      //   Math.floor(rowIndex - this.warpIndexOffset),
      //   Math.ceil(rowIndex + this.warpIndexOffset) + 1
      // )
      .forEach((line, i) => {
        if (i > rowStartIndex && i < rowEndIndex) {
          line.warp(this.mass, y, x)
        } else {
          line.unwarp()
        }
      })

    const colIndex = x / this.gap
    const colStartIndex = Math.floor(colIndex - this.warpIndexOffset)
    const colEndIndex = Math.ceil(colIndex + this.warpIndexOffset) + 1
    this.cols
      // .slice(
      //   Math.floor(colIndex - this.warpIndexOffset),
      //   Math.ceil(colIndex + this.warpIndexOffset) + 1
      // )
      .forEach((line, i) => {
        if (i > colStartIndex && i < colEndIndex) {
          line.warp(this.mass, x, y)
        } else {
          line.unwarp()
        }
      })
  }

  public unwarp(x: number, y: number) {
    const rowIndex = y / this.gap
    this.rows
      .slice(
        Math.floor(rowIndex - this.warpIndexOffset),
        Math.ceil(rowIndex + this.warpIndexOffset) + 1
      )
      .forEach((line) => line.unwarp())

    const colIndex = x / this.gap
    this.cols
      .slice(
        Math.floor(colIndex - this.warpIndexOffset),
        Math.ceil(colIndex + this.warpIndexOffset) + 1
      )
      .forEach((line) => line.unwarp())
  }

  public cleanup() {
    this.clear()
    this.observer.disconnect()
  }
}

export function GraphMouseWarp() {
  const containerRef = React.useRef<SVGSVGElement>(null)
  const grid = React.useRef<Grid>()

  React.useLayoutEffect(() => {
    if (containerRef.current) {
      grid.current = new Grid(containerRef.current)
    }

    return () => grid.current?.cleanup()
  }, [])

  function handleMouseMove(event: React.MouseEvent<SVGSVGElement>) {
    grid.current?.warp(event.clientX, event.clientY)
  }

  function handleMouseLeave(event: React.MouseEvent<SVGSVGElement>) {
    grid.current?.unwarp(event.clientX, event.clientY)
  }

  return (
    <svg
      xmlns={SVG_NAMESPACE}
      ref={containerRef}
      className="w-screen h-screen bg-gray-100 stroke-blue-300 stroke-1 fill-none"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    />
  )
}
