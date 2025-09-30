<template>
  <div class="editor-container">
    <div class="toolbar">
      <button @click="addText">Add Text</button>
      <button @click="addImage">Add Random Image</button>
      <button @click="addImageFromUrl">Add Image URL</button>
      <button @click="uploadImage">Upload Image</button>
    </div>
    <div class="canvas-wrapper">
      <v-stage :config="stageSize" @click="handleStageClick" @tap="handleStageClick">
        <v-layer>
          <!-- Text Elements -->
          <EditableText
            v-for="element in textElements"
            :key="'text-' + element.id"
            :text-element="element"
            :is-selected="selectedElementIndex === elements.indexOf(element)"
            @select="selectElement(elements.indexOf(element))"
            @element-updated="handleElementUpdated"
            @context-menu="handleElementContextMenu"
          />
          
          <!-- Image Elements -->
          <EditableImage
            v-for="element in imageElements"
            :key="'image-' + element.id"
            :image-element="element"
            :is-selected="selectedElementIndex === elements.indexOf(element)"
            @select="selectElement(elements.indexOf(element))"
            @element-updated="handleElementUpdated"
            @upload-complete="handleUploadComplete"
          />
        </v-layer>
      </v-stage>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import EditableText from './components/EditableText.vue'
import EditableImage from './components/EditableImage.vue'
import { CanvasElement, TextElement, ImageElement, ElementFactory } from './models'

const width = window.innerWidth
const height = window.innerHeight - 60

const stageSize = ref({ width, height })
let nextId = 1

// Unified elements array using class system
const elements = ref<CanvasElement[]>([
  ElementFactory.createElement('text', nextId++, { 
    text: 'Double-click to edit', 
    x: 50, 
    y: 50 
  })
])

// Computed properties to separate element types
const textElements = computed(() => {
  const texts = elements.value.filter(el => el instanceof TextElement) as TextElement[]
  console.log('textElements computed:', texts.length, texts)
  return texts
})

const imageElements = computed(() => 
  elements.value.filter(el => el instanceof ImageElement) as ImageElement[]
)

const selectedElementIndex = ref<number | null>(null)
const elementComponentRefs = ref<any[]>([])

function addText() {
  const textElement = ElementFactory.createElement('text', nextId++, {
    text: 'Double-click to edit',
    x: 100,
    y: 100
  })
  elements.value.push(textElement)
  selectedElementIndex.value = elements.value.length - 1
}

function addImage() {
  const minSize = 200;
  const maxSize = 800;
  const randomSize = () => Math.floor(Math.random() * (maxSize - minSize + 1)) + minSize;
  const width = randomSize();
  const height = randomSize();
  const randomImage = `https://picsum.photos/${width}/${height}`;

  const imageElement = ElementFactory.createElement('image', nextId++, {
    src: randomImage,
    x: 150,
    y: 150,
    width: 0,
    height: 0
  })
  
  elements.value.push(imageElement)
  selectedElementIndex.value = elements.value.length - 1
}

function addImageFromUrl() {
  const imageUrl = prompt('Enter image URL:', 'https://picsum.photos/400/300')
  
  if (imageUrl && imageUrl.trim()) {
    const imageElement = ElementFactory.createElement('image', nextId++, {
      src: imageUrl.trim(),
      x: 100,
      y: 100,
      width: 0,
      height: 0
    })
    
    elements.value.push(imageElement)
    selectedElementIndex.value = elements.value.length - 1
  }
}

function uploadImage() {
  // Find first image component for upload capability
  const imageComponents = elementComponentRefs.value.filter((ref, index) => 
    elements.value[index] instanceof ImageElement
  )
  
  if (imageComponents.length > 0 && imageComponents[0]) {
    imageComponents[0].triggerUpload()
  } else {
    // Fallback: create a temporary file input
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e) => handleFallbackUpload(e)
    input.click()
  }
}

function handleFallbackUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file && file.type.startsWith('image/')) {
    const reader = new FileReader()
    reader.onload = (e) => {
      handleUploadComplete({
        src: e.target?.result as string,
        x: 120,
        y: 120,
        width: 0,
        height: 0,
      })
    }
    reader.readAsDataURL(file)
  }
}

function handleUploadComplete(imageData: any) {
  const imageElement = ElementFactory.createElement('image', nextId++, imageData)
  elements.value.push(imageElement)
  selectedElementIndex.value = elements.value.length - 1
}

function setElementComponentRef(idx: number, el: any) {
  elementComponentRefs.value[idx] = el
}

// Unified element functions using class system
function selectElement(idx: number) {
  selectedElementIndex.value = idx
}

function handleElementDragStart(idx: number) {
  elements.value[idx].startDrag()
}

function handleElementDragEnd(idx: number, position: { x: number, y: number }) {
  elements.value[idx].endDrag(position.x, position.y)
}

function handleElementTransform(idx: number, data: any) {
  const element = elements.value[idx]
  if (element instanceof TextElement) {
    element.setWidth(data.width)
  } else if (element instanceof ImageElement) {
    element.setDimensions(data.width, data.height)
  }
}

function handleElementUpdateText(idx: number, newText: string) {
  const element = elements.value[idx]
  if (element instanceof TextElement) {
    element.setText(newText)
  }
}

function handleElementUpdated(element: CanvasElement) {
  // Find the element by ID in the main array and update it
  const globalIdx = elements.value.findIndex(el => el.id === element.id)
  
  if (globalIdx !== -1) {
    elements.value[globalIdx] = element
  }
}

function handleElementContextMenu(evt: Event) {
  evt.preventDefault()
  console.log('Right click on element')
}

// Stage click handler - deselect when clicking empty area
function handleStageClick(evt: any) {
  const clickedOnEmpty = evt.target === evt.target.getStage()
  if (clickedOnEmpty) {
    selectedElementIndex.value = null
  }
}
</script>

<style scoped>
.editor-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}
.toolbar {
  height: 60px;
  background: #f2f2f2;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0 1rem;
  border-bottom: 1px solid #ddd;
}

.toolbar button {
  padding: 0.5rem 1rem;
  background: #007acc;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.toolbar button:hover {
  background: #005a9e;
}

.toolbar button:active {
  transform: translateY(1px);
}
.canvas-wrapper {
  flex: 1;
  overflow: hidden;
  background: #eee;
  display: flex;
  align-items: center;
  justify-content: center;
}
.v-stage {
  background: #fff !important;
  border: 2px solid #444;
  box-sizing: content-box;
  display: block;
}
</style>