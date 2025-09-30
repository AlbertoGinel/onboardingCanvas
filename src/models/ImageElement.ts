import { CanvasElement } from './CanvasElement'

// Image element class
export class ImageElement extends CanvasElement {
  public src: string
  public width: number
  public height: number
  public scaleX: number
  public scaleY: number

  constructor(
    id: number, 
    src: string, 
    x: number = 0, 
    y: number = 0, 
    width: number = 0, 
    height: number = 0
  ) {
    super(id, x, y)
    this.src = src
    this.width = width
    this.height = height
    this.scaleX = 1
    this.scaleY = 1
  }

  public getType(): string {
    return 'image'
  }

  public setSrc(src: string): void {
    this.src = src
  }

  public setDimensions(width: number, height: number): void {
    this.width = Math.max(30, width)
    this.height = Math.max(30, height)
  }

  public setScale(scaleX: number, scaleY: number): void {
    this.scaleX = scaleX
    this.scaleY = scaleY
  }

  public getKonvaConfig(): any {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      scaleX: this.scaleX,
      scaleY: this.scaleY,
      rotation: this.rotation,
      opacity: this.isDragging ? 0.8 : this.opacity,
      draggable: true,
    }
  }

  public getTransformerConfig(): any {
    return {
      rotateEnabled: true,
      enabledAnchors: [
        'top-left', 'top-center', 'top-right',
        'middle-left', 'middle-right',
        'bottom-left', 'bottom-center', 'bottom-right'
      ],
      boundBoxFunc: (oldBox: any, newBox: any) => {
        newBox.width = Math.max(30, newBox.width)
        newBox.height = Math.max(30, newBox.height)
        return newBox
      },
    }
  }

  public handleTransform(evt: any, node: any, emitCallback?: (element: this) => void): void {
    if (!node) return
    
    const scaleX = node.scaleX()
    const scaleY = node.scaleY()
    
    // Reset scale and apply to width/height instead
    node.scaleX(1)
    node.scaleY(1)
    
    const newWidth = Math.max(30, node.width() * scaleX)
    const newHeight = Math.max(30, node.height() * scaleY)
    
    node.width(newWidth)
    node.height(newHeight)
    
    // Update the element's dimensions
    this.width = Math.round(newWidth)
    this.height = Math.round(newHeight)
    
    if (emitCallback) emitCallback(this)
  }

  public clone(): ImageElement {
    const cloned = new ImageElement(
      this.id, 
      this.src, 
      this.x + 10, 
      this.y + 10, 
      this.width, 
      this.height
    )
    cloned.scaleX = this.scaleX
    cloned.scaleY = this.scaleY
    cloned.rotation = this.rotation
    cloned.opacity = this.opacity
    return cloned
  }
}