// Base abstract class for all canvas elements
export abstract class CanvasElement {
  public id: number
  public x: number
  public y: number
  public isDragging: boolean
  public rotation: number
  public opacity: number
  
  constructor(id: number, x: number = 0, y: number = 0) {
    this.id = id
    this.x = x
    this.y = y
    this.isDragging = false
    this.rotation = 0
    this.opacity = 1
  }

  // Common methods all elements share
  public setPosition(x: number, y: number): void {
    this.x = x
    this.y = y
  }

  public startDrag(): void {
    this.isDragging = true
  }

  public endDrag(x: number, y: number): void {
    this.isDragging = false
    this.setPosition(x, y)
  }

  public setRotation(rotation: number): void {
    this.rotation = rotation
  }

  public setOpacity(opacity: number): void {
    this.opacity = Math.max(0, Math.min(1, opacity))
  }

  // Common event handlers for drag and transform
  public handleDragStart(emitCallback?: () => void): void {
    this.startDrag()
    if (emitCallback) emitCallback()
  }

  public handleDragEnd(evt: any, emitCallback?: (element: this) => void): void {
    const node = evt.target
    this.setPosition(node.x(), node.y())
    this.endDrag(node.x(), node.y())
    if (emitCallback) emitCallback(this)
  }

  // Abstract methods that must be implemented by subclasses
  public abstract getType(): string
  public abstract getKonvaConfig(): any
  public abstract clone(): CanvasElement
  public abstract getTransformerConfig(): any
  public abstract handleTransform(evt: any, node: any, emitCallback?: (element: this) => void): void
}