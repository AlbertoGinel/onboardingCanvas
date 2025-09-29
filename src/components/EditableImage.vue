<template>
  <v-image
    :config="{
      image: imageElement,
      x: imageObj.x,
      y: imageObj.y,
      width: imageObj.width,
      height: imageObj.height,
      draggable: true,
      opacity: imageObj.isDragging ? 0.8 : 1,
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

<script setup>
import { ref, onMounted, watch } from 'vue'

const props = defineProps({
  imageObj: {
    type: Object,
    required: true
  },
  isSelected: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['select', 'drag-start', 'drag-end', 'transform', 'context-menu', 'upload-complete'])

const imageElement = ref(null)
const imageNode = ref(null)
const fileInput = ref(null)

const transformerConfig = {
  rotateEnabled: true,
  enabledAnchors: [
    'top-left', 'top-center', 'top-right',
    'middle-left', 'middle-right',
    'bottom-left', 'bottom-center', 'bottom-right'
  ],
  boundBoxFunc: (oldBox, newBox) => {
    // Maintain aspect ratio when shift is held (optional)
    newBox.width = Math.max(30, newBox.width);
    newBox.height = Math.max(30, newBox.height);
    return newBox;
  },
}

function setImageRef(el) {
  imageNode.value = el?.getNode?.() || null
}

function loadImage() {
  const img = new Image()
  img.crossOrigin = 'anonymous'
  
  img.onload = () => {
    imageElement.value = img
    
    // If no dimensions set, use natural dimensions (scaled down if too large)
    if (!props.imageObj.width || !props.imageObj.height) {
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
      
      emit('transform', { 
        width: Math.round(width), 
        height: Math.round(height) 
      })
    }
  }
  
  img.onerror = () => {
    console.error('Failed to load image:', props.imageObj.src)
    // Load a fallback placeholder
    loadPlaceholder()
  }
  
  img.src = props.imageObj.src
}

function loadPlaceholder() {
  // Create a simple colored rectangle as fallback
  const canvas = document.createElement('canvas')
  canvas.width = 200
  canvas.height = 150
  const ctx = canvas.getContext('2d')
  
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
  
  imageElement.value = canvas
}

function handleClick() {
  emit('select')
}

function handleDragStart() {
  emit('drag-start')
}

function handleDragEnd(evt) {
  const newPosition = {
    x: evt.target.x(),
    y: evt.target.y()
  }
  emit('drag-end', newPosition)
}

function handleTransform(e) {
  const node = imageNode.value
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
  
  emit('transform', { 
    width: Math.round(newWidth), 
    height: Math.round(newHeight) 
  })
}

// Watch for src changes
watch(() => props.imageObj.src, () => {
  loadImage()
}, { immediate: true })

// Static method for triggering file upload
function triggerUpload() {
  fileInput.value?.click()
}

function handleFileUpload(event) {
  const file = event.target.files[0]
  if (file && file.type.startsWith('image/')) {
    const reader = new FileReader()
    reader.onload = (e) => {
      // Emit the upload result back to parent
      emit('upload-complete', {
        src: e.target.result, // Base64 data URL
        x: 120,
        y: 120,
        width: 0, // Will be auto-calculated
        height: 0, // Will be auto-calculated
        isDragging: false,
      })
    }
    reader.readAsDataURL(file)
    // Reset the input so the same file can be selected again
    event.target.value = ''
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