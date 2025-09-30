import { CanvasElement } from './CanvasElement'
import { TextElement } from './TextElement'
import { ImageElement } from './ImageElement'

// Factory function to create elements
export class ElementFactory {
  public static createElement(type: 'text' | 'image', id: number, options: any = {}): CanvasElement {
    switch (type) {
      case 'text':
        return new TextElement(
          id,
          options.text || 'Double-click to edit',
          options.x || 100,
          options.y || 100
        )
      case 'image':
        return new ImageElement(
          id,
          options.src || '',
          options.x || 150,
          options.y || 150,
          options.width || 0,
          options.height || 0
        )
      default:
        throw new Error(`Unknown element type: ${type}`)
    }
  }
}