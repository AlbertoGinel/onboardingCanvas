<template>
  <v-image
    :config="{
      image: imageElementRef,
      ...props.imageElement.getKonvaConfig(),
    }"
    @click="handleClick"
    @tap="handleClick"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
    @transform="handleTransform"
    :ref="setImageRef"
  />
  <v-transformer
    v-if="isSelected"
    :config="transformerConfig"
    :nodes="imageNode ? [imageNode] : []"
  />
  
  <!-- Hidden file input for upload functionality -->
  <input 
    ref="fileInput" 
    type="file" 
    accept="image/*" 
    @change="handleFileUpload"
    style="display: none;"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { ImageElement } from '../models/ImageElement'
import type { KonvaNode } from '../types/konva'

const props = defineProps<{
  imageElement: ImageElement
  isSelected: boolean
}>()

const emit = defineEmits<{
  select: []
  'drag-start': []
  'drag-end': [{ x: number, y: number }]
  transform: [{ width: number, height: number }]
  'context-menu': [Event]
  'upload-complete': [any]
  'elementUpdated': [ImageElement]
}>()

const imageElementRef = ref<HTMLImageElement | HTMLCanvasElement | null>(null)
const imageNode = ref<KonvaNode | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

// Use the transformer config from the class
const transformerConfig = props.imageElement.getTransformerConfig()

function setImageRef(el: any) {
  imageNode.value = el?.getNode?.() || null
}

function loadImage() {
  const img = new Image()
  img.crossOrigin = 'anonymous'
  
  img.onload = () => {
    imageElementRef.value = img
    
    // If no dimensions set, use natural dimensions (scaled down if too large)
    if (!props.imageElement.width || !props.imageElement.height) {
      const maxSize = 300
      const aspectRatio = img.naturalWidth / img.naturalHeight
      
      let width = img.naturalWidth
      let height = img.naturalHeight
      
      if (width > maxSize || height > maxSize) {
        if (width > height) {
          width = maxSize
          height = maxSize / aspectRatio
        } else {
          height = maxSize
          width = maxSize * aspectRatio
        }
      }
      
      // Update the class instance
      props.imageElement.setDimensions(Math.round(width), Math.round(height))
      emit('transform', { 
        width: Math.round(width), 
        height: Math.round(height) 
      })
    }
  }
  
  img.onerror = () => {
    console.error('Failed to load image:', props.imageElement.src)
    // Load a fallback placeholder
    loadPlaceholder()
  }
  
  img.src = props.imageElement.src
}

function loadPlaceholder() {
  // Create a simple colored rectangle as fallback
  const canvas = document.createElement('canvas')
  canvas.width = 200
  canvas.height = 150
  const ctx = canvas.getContext('2d')
  
  if (ctx) {
    // Draw placeholder
    ctx.fillStyle = '#f0f0f0'
    ctx.fillRect(0, 0, 200, 150)
    ctx.strokeStyle = '#ccc'
    ctx.strokeRect(0, 0, 200, 150)
    
    // Draw X
    ctx.strokeStyle = '#999'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(20, 20)
    ctx.lineTo(180, 130)
    ctx.moveTo(180, 20)
    ctx.lineTo(20, 130)
    ctx.stroke()
    
    // Add text
    ctx.fillStyle = '#666'
    ctx.font = '16px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('Image not found', 100, 80)
  }
  
  imageElementRef.value = canvas
}

function handleClick() {
  emit('select')
}

function handleDragStart() {
  props.imageElement.handleDragStart(() => emit('drag-start'))
}

function handleDragEnd(evt: any) {
  props.imageElement.handleDragEnd(evt, (element) => emit('elementUpdated', element))
}

function handleTransform(e: any) {
  props.imageElement.handleTransform(e, imageNode.value, (element) => emit('elementUpdated', element))
}

// Watch for src changes
watch(() => props.imageElement.src, () => {
  loadImage()
}, { immediate: true })

// Static method for triggering file upload
function triggerUpload() {
  fileInput.value?.click()
}

function handleFileUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file && file.type.startsWith('image/')) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result
      if (result) {
        // Emit the upload result back to parent
        emit('upload-complete', {
          src: result, // Base64 data URL
          x: 120,
          y: 120,
          width: 0, // Will be auto-calculated
          height: 0, // Will be auto-calculated
          isDragging: false,
        })
      }
    }
    reader.readAsDataURL(file)
    // Reset the input so the same file can be selected again
    target.value = ''
  }
}

// Expose the upload trigger method
defineExpose({
  triggerUpload
})

onMounted(() => {
  loadImage()
})
</script>