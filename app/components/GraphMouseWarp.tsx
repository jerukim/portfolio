import * as React from 'react'
class DistortionGrid {
  public mass = 100
  public gap = 20

  private x: number | null = null
  private y: number | null = null
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private observer = new ResizeObserver(([entry]) =>
    this.handleResize(entry)
  )

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas

    const ctx = this.canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas not supported')
    this.ctx = ctx

    this.observer.observe(this.canvas)
    this.canvas.addEventListener('mousemove', this.handleMouseMove)
    this.canvas.addEventListener('mouseleave', this.handleMouseLeave)
  }

  drawCircle(x: number, y: number, r: number, fill: string) {
    this.ctx.beginPath()
    this.ctx.arc(x, y, r, 0, 2 * Math.PI)
    this.ctx.fillStyle = fill
    this.ctx.fill()
    this.ctx.closePath()
  }

  private drawGrid = () => {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    const offset1 = 0.05
    const offset2 = 0.1
    const control1 = 1
    const control2 = 4

    for (let x = 0; x < this.canvas.width; x += this.gap) {
      this.ctx.beginPath()
      this.ctx.moveTo(x, 0)

      if (this.x && this.y) {
        const diff = (x > this.x ? -1 : 1) * this.mass + x - this.x

        this.ctx.lineTo(x, this.y - this.mass)

        if (this.x && Math.abs(x - this.x) < this.mass) {
          this.ctx.quadraticCurveTo(
            x,
            this.y - this.mass + this.gap * control1,
            x - diff * offset1,
            this.y - this.mass + this.gap * 2
          )
          this.ctx.quadraticCurveTo(
            x - diff * offset2,
            this.y - this.mass + this.gap * control2,
            x - diff * offset2,
            this.y
          )
          this.ctx.quadraticCurveTo(
            x - diff * offset2,
            this.y + this.mass - this.gap * control2,
            x - diff * offset1,
            this.y + this.mass - this.gap * 2
          )
          this.ctx.quadraticCurveTo(
            x,
            this.y + this.mass - this.gap * control1,
            x,
            this.y + this.mass
          )
        }
      }

      this.ctx.lineTo(x, this.canvas.height)
      this.ctx.stroke()
      this.ctx.closePath()
    }

    for (let y = 0; y < this.canvas.width; y += this.gap) {
      this.ctx.beginPath()
      this.ctx.moveTo(0, y)

      if (this.x && this.y) {
        const diff = (y > this.y ? -1 : 1) * this.mass + y - this.y

        this.ctx.lineTo(this.x - this.mass, y)

        if (this.y && Math.abs(y - this.y) < this.mass) {
          this.ctx.quadraticCurveTo(
            this.x - this.mass + this.gap * control1,
            y,
            this.x - this.mass + this.gap * 2,
            y - diff * offset1
          )
          this.ctx.quadraticCurveTo(
            this.x - this.mass + this.gap * control2,
            y - diff * offset2,
            this.x,
            y - diff * offset2
          )
          this.ctx.quadraticCurveTo(
            this.x + this.mass - this.gap * control2,
            y - diff * offset2,
            this.x + this.mass - this.gap * 2,
            y - diff * offset1
          )
          this.ctx.quadraticCurveTo(
            this.x + this.mass - this.gap * control1,
            y,
            this.x + this.mass,
            y
          )
        }
      }
      this.ctx.lineTo(this.canvas.width, y)
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
      className="h-screen w-screen"
    />
  )
}
