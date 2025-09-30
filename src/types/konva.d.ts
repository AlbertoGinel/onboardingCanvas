// Konva types for better TypeScript support
declare global {
  interface Window {
    Konva?: {
      _fixTextRendering?: boolean
    }
  }
}

export interface KonvaNode {
  x(): number
  x(value: number): void
  y(): number  
  y(value: number): void
  width(): number
  width(value: number): void
  height(): number
  height(value: number): void
  scaleX(): number
  scaleX(value: number): void
  scaleY(): number
  scaleY(value: number): void
  rotation(): number
  rotation(value: number): void
  setAttrs(attrs: any): void
  getStage(): any
  absolutePosition(): { x: number, y: number }
  padding(): number
  lineHeight(): number
  getAbsoluteScale(): { x: number, y: number }
  // Text-specific properties (optional for image nodes)
  text?: () => string
  text?: (value: string) => void
  fontSize?: () => number
  fontSize?: (value: number) => void
  fontFamily?: () => string
  fontFamily?: (value: string) => void
  fill?: () => string
  fill?: (value: string) => void
  align?: () => string
  align?: (value: string) => void
  placeholder?: string
}

export {}