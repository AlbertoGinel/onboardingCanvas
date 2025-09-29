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
          <!-- Images Layer (behind text) -->
          <EditableImage
            v-for="(obj, idx) in images"
            :key="'img-' + obj.id"
            :image-obj="obj"
            :is-selected="selectedImageIndex === idx"
            :ref="el => setImageComponentRef(idx, el)"
            @select="selectImage(idx)"
            @drag-start="startImageDrag(idx)"
            @drag-end="endImageDrag(idx, $event)"
            @transform="handleImageTransform(idx, $event)"
            @context-menu="handleImageContextMenu"
            @upload-complete="handleUploadComplete"
          />
          
          <!-- Text Layer (in front of images) -->
          <EditableText
            v-for="(obj, idx) in texts"
            :key="'text-' + obj.id"
            :text-obj="obj"
            :is-selected="selectedTextIndex === idx && selectedImageIndex === null"
            @update:text="updateText(idx, $event)"
            @select="selectText(idx)"
            @drag-start="startTextDrag(idx)"
            @drag-end="endTextDrag(idx, $event)"
            @transform="handleTextTransform(idx, $event)"
            @context-menu="handleTextContextMenu"
          />
        </v-layer>
      </v-stage>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import EditableText from './components/EditableText.vue'
import EditableImage from './components/EditableImage.vue'

const width = window.innerWidth
const height = window.innerHeight - 60

const stageSize = ref({ width, height })
let nextId = 1

const texts = ref([
  { id: nextId++, text: 'Double-click to edit', x: 50, y: 50, isDragging: false, width: 200 },
])
const selectedTextIndex = ref(null)

const images = ref([])
const selectedImageIndex = ref(null)
const imageComponentRefs = ref([])


function addText() {
  // Clear image selection when adding text
  selectedImageIndex.value = null
  texts.value.push({
    id: nextId++,
    text: 'Double-click to edit',
    x: 100,
    y: 100,
    isDragging: false,
    width: 200,
  })
}

function addImage() {
  // Clear text selection when adding image
  selectedTextIndex.value = null
  const minSize = 200;
  const maxSize = 800;

  const randomSize = () => Math.floor(Math.random() * (maxSize - minSize + 1)) + minSize;

  const width = randomSize();
  const height = randomSize();

  const randomImage = `https://picsum.photos/${width}/${height}`;

  images.value.push({
    id: nextId++,
    src: randomImage,
    x: 150,
    y: 150,
    width: 0, // Let EditableImage auto-calculate from natural dimensions
    height: 0, // Let EditableImage auto-calculate from natural dimensions
    isDragging: false,
  })
  // Select the newly added image
  selectedImageIndex.value = images.value.length - 1
}

function addImageFromUrl() {
  const imageUrl = prompt('Enter image URL:', 'https://picsum.photos/400/300')
  
  if (imageUrl && imageUrl.trim()) {
    // Clear text selection when adding image
    selectedTextIndex.value = null
    
    images.value.push({
      id: nextId++,
      src: imageUrl.trim(),
      x: 100,
      y: 100,
      width: 0, // Will be auto-calculated by EditableImage
      height: 0, // Will be auto-calculated by EditableImage
      isDragging: false,
    })
    
    // Select the newly added image
    selectedImageIndex.value = images.value.length - 1
  }
}

function uploadImage() {
  // Create a temporary EditableImage component to handle upload
  // We'll use the first image component if available, or create a dummy one
  if (imageComponentRefs.value.length > 0 && imageComponentRefs.value[0]) {
    imageComponentRefs.value[0].triggerUpload()
  } else {
    // Fallback: create a temporary file input
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e) => handleFallbackUpload(e)
    input.click()
  }
}

function handleFallbackUpload(event) {
  const file = event.target.files[0]
  if (file && file.type.startsWith('image/')) {
    const reader = new FileReader()
    reader.onload = (e) => {
      handleUploadComplete({
        src: e.target.result,
        x: 120,
        y: 120,
        width: 0,
        height: 0,
        isDragging: false,
      })
    }
    reader.readAsDataURL(file)
  }
}

function handleUploadComplete(imageData) {
  selectedTextIndex.value = null
  images.value.push({
    id: nextId++,
    ...imageData
  })
  selectedImageIndex.value = images.value.length - 1
}

function setImageComponentRef(idx, el) {
  imageComponentRefs.value[idx] = el
}
// Text functions
function selectText(idx) {
  selectedTextIndex.value = idx
  selectedImageIndex.value = null // Clear image selection
}

function startTextDrag(idx) {
  texts.value[idx].isDragging = true
}

function endTextDrag(idx, position) {
  texts.value[idx].isDragging = false
  texts.value[idx].x = position.x
  texts.value[idx].y = position.y
}

function updateText(idx, newText) {
  texts.value[idx].text = newText
}

function handleTextTransform(idx, data) {
  texts.value[idx].width = data.width
}

function handleTextContextMenu(evt) {
  evt.evt.preventDefault();
  console.log('Right click on text');
}

// Image functions
function selectImage(idx) {
  selectedImageIndex.value = idx
  selectedTextIndex.value = null // Clear text selection
}

function startImageDrag(idx) {
  images.value[idx].isDragging = true
}

function endImageDrag(idx, position) {
  images.value[idx].isDragging = false
  images.value[idx].x = position.x
  images.value[idx].y = position.y
}

function handleImageTransform(idx, data) {
  images.value[idx].width = data.width
  images.value[idx].height = data.height
}

function handleImageContextMenu(evt) {
  evt.evt.preventDefault();
  console.log('Right click on image');
}

// Stage click handler - deselect when clicking empty area
function handleStageClick(evt) {
  // Check if the click target is the stage itself (not a child element)
  const clickedOnEmpty = evt.target === evt.target.getStage()
  
  if (clickedOnEmpty) {
    // Deselect all objects when clicking on empty canvas
    selectedTextIndex.value = null
    selectedImageIndex.value = null
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