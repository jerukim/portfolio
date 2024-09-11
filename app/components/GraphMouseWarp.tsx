import * as React from 'react'

// TODO: optimize by only clearing rows/cols that need to be redrawn

type Coordinate = [x: number, y: number]

class DistortionGrid {
  public mass = 100
  public gap = 20
  public offsets: [number, number] = [0.05, 0.1]
  public control: [number, number, number] = [2.5, 3.25, 4.5]
  public strokeStyle = '#96ADE9'

  private x: number | null = null
  private y: number | null = null
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private observer = new ResizeObserver(([entry]) =>
    this.handleResize(entry)
  )

  // support mass, gap, offets, controls options
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas

    const ctx = this.canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas not supported')
    this.ctx = ctx

    this.observer.observe(this.canvas)
    this.canvas.addEventListener('mousemove', this.handleMouseMove)
    this.canvas.addEventListener('mouseleave', this.handleMouseLeave)
  }

  addCurve(axis: 'x' | 'y', m: number, n: number, weight: number) {
    const curves: [Coordinate, Coordinate][] = [
      [
        [m, n - this.mass + this.gap * this.control[0]],
        [
          m - weight * this.offsets[0],
          n - this.mass + this.gap * this.control[1],
        ],
      ],
      [
        [
          m - weight * this.offsets[1],
          n - this.mass + this.gap * this.control[2],
        ],
        [m - weight * this.offsets[1], n],
      ],
      [
        [
          m - weight * this.offsets[1],
          n + this.mass - this.gap * this.control[2],
        ],
        [
          m - weight * this.offsets[0],
          n + this.mass - this.gap * this.control[1],
        ],
      ],
      [
        [m, n + this.mass - this.gap * this.control[0]],
        [m, n + this.mass],
      ],
    ]

    for (const part of curves) {
      if (axis === 'y') {
        part.forEach((coordinate) => coordinate.reverse())
      }

      const [control, to] = part

      this.ctx.quadraticCurveTo(...control, ...to)
    }
  }

  private drawGrid = () => {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    for (let x = 0; x < this.canvas.width; x += this.gap) {
      this.ctx.beginPath()
      this.ctx.moveTo(x, 0)

      if (this.x && this.y) {
        this.ctx.lineTo(x, this.y - this.mass)

        if (Math.abs(x - this.x) < this.mass) {
          const diff = (x > this.x ? -1 : 1) * this.mass + x - this.x
          this.addCurve('x', x, this.y, diff)
        }
      }

      this.ctx.lineTo(x, this.canvas.height)
      this.ctx.strokeStyle = this.strokeStyle
      this.ctx.stroke()
      this.ctx.closePath()
    }

    for (let y = 0; y < this.canvas.height; y += this.gap) {
      this.ctx.beginPath()
      this.ctx.moveTo(0, y)

      if (this.x && this.y) {
        this.ctx.lineTo(this.x - this.mass, y)

        if (Math.abs(y - this.y) < this.mass) {
          const diff = (y > this.y ? -1 : 1) * this.mass + y - this.y
          this.addCurve('y', y, this.x, diff)
        }
      }

      this.ctx.lineTo(this.canvas.width, y)
      this.ctx.strokeStyle = this.strokeStyle
      this.ctx.stroke()
      this.ctx.closePath()
    }
  }

  private handleResize = (entry: ResizeObserverEntry) => {
    this.canvas.width = entry.contentRect.width
    this.canvas.height = entry.contentRect.height
    this.drawGrid()
  }

  private handleMouseMove = (event: MouseEvent) => {
    this.x = event.clientX
    this.y = event.clientY
    this.drawGrid()
  }

  private handleMouseLeave = (event: MouseEvent) => {
    this.x = null
    this.y = null
    this.drawGrid()
  }

  public cleanup = () => {
    this.observer.unobserve(this.canvas)
    this.canvas.removeEventListener('mousemove', this.handleMouseMove)
    this.canvas.removeEventListener(
      'mouseleave',
      this.handleMouseLeave
    )
  }
}

export function GraphMouseWarp() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const grid = React.useRef<DistortionGrid>()

  React.useEffect(() => {
    if (canvasRef.current?.getContext) {
      grid.current = new DistortionGrid(canvasRef.current)
    }

    return grid.current?.cleanup
  }, [])

  return (
    <canvas
      ref={canvasRef}
      id="warp-grid"
      className="h-screen w-screen bg-slate-100"
    />
  )
}
