import { CanvasElement } from './CanvasElement'

// Text element class
export class TextElement extends CanvasElement {
  public text: string
  public fontSize: number
  public fontFamily: string
  public fill: string
  public width: number
  public align: string

  constructor(
    id: number, 
    text: string = 'New Text', 
    x: number = 0, 
    y: number = 0
  ) {
    super(id, x, y)
    this.text = text
    this.fontSize = 30
    this.fontFamily = 'Arial'
    this.fill = 'black'
    this.width = 200
    this.align = 'left'
  }

  public getType(): string {
    return 'text'
  }

  public setText(text: string): void {
    this.text = text
  }

  public setFontSize(size: number): void {
    this.fontSize = Math.max(8, size)
  }

  public setWidth(width: number): void {
    this.width = Math.max(30, width)
  }

  public getKonvaConfig(): any {
    return {
      text: this.text,
      x: this.x,
      y: this.y,
      fontSize: this.fontSize,
      fontFamily: this.fontFamily,
      fill: this.isDragging ? 'green' : this.fill,
      width: this.width,
      align: this.align,
      rotation: this.rotation,
      opacity: this.opacity,
      draggable: true,
    }
  }

  public getTransformerConfig(): any {
    return {
      rotateEnabled: true,
      enabledAnchors: ['middle-left', 'middle-right'],
      boundBoxFunc: (oldBox: any, newBox: any) => {
        newBox.width = Math.max(30, newBox.width)
        return newBox
      },
    }
  }

  public handleTransform(evt: any, node: any, emitCallback?: (element: this) => void): void {
    if (!node) return
    
    const newWidth = node.width() * node.scaleX()
    
    node.setAttrs({
      width: newWidth,
      scaleX: 1,
    })
    
    // Update the element's width
    this.width = newWidth
    
    if (emitCallback) emitCallback(this)
  }

  public clone(): TextElement {
    const cloned = new TextElement(this.id, this.text, this.x + 10, this.y + 10)
    cloned.fontSize = this.fontSize
    cloned.fontFamily = this.fontFamily
    cloned.fill = this.fill
    cloned.width = this.width
    cloned.align = this.align
    cloned.rotation = this.rotation
    cloned.opacity = this.opacity
    return cloned
  }
}