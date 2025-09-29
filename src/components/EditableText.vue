<template>
  <v-text
    :config="{
      text: textObj.text,
      x: textObj.x,
      y: textObj.y,
      draggable: true,
      fill: textObj.isDragging ? 'green' : 'black',
      fontSize: 30,
      width: textObj.width || 200,
      visible: !isEditing,
    }"
    @contextmenu="handleContextMenu"
    @click="handleClick"
    @tap="handleClick"
    @dblclick="handleTextDblClick"
    @dbltap="handleTextDblClick"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
    @transform="handleTransform"
    :ref="setTextRef"
  />
  <v-transformer
    v-if="isSelected && !isEditing"
    :config="transformerConfig"
    :nodes="textNode ? [textNode] : []"
  />
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  textObj: {
    type: Object,
    required: true
  },
  isSelected: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:text', 'select', 'drag-start', 'drag-end', 'transform', 'context-menu'])

// Fix text rendering issue in Konva
if (window.Konva) {
  window.Konva._fixTextRendering = true;
}

const isEditing = ref(false)
const textNode = ref(null)

const transformerConfig = {
  rotateEnabled: true,
  enabledAnchors: ['middle-left', 'middle-right'],
  boundBoxFunc: (oldBox, newBox) => {
    newBox.width = Math.max(30, newBox.width);
    return newBox;
  },
}

function setTextRef(el) {
  textNode.value = el?.getNode?.() || null
}

function handleClick() {
  emit('select')
}

function handleContextMenu(evt) {
  evt.evt.preventDefault()
  emit('context-menu', evt)
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
  const node = textNode.value
  if (!node) return
  
  const newWidth = node.width() * node.scaleX()
  
  node.setAttrs({
    width: newWidth,
    scaleX: 1,
  })
  
  emit('transform', { width: newWidth })
}

function handleTextDblClick() {
  if (isEditing.value) return;
  
  const node = textNode.value
  if (!node) return;

  const stage = node.getStage();
  const textPosition = node.absolutePosition();
  const stageBox = stage.container().getBoundingClientRect();

  const areaPosition = {
    x: stageBox.left + textPosition.x,
    y: stageBox.top + textPosition.y,
  };

  const textarea = document.createElement('textarea');
  document.body.appendChild(textarea);

  textarea.value = node.text();
  textarea.style.position = 'absolute';
  textarea.style.top = areaPosition.y + 'px';
  textarea.style.left = areaPosition.x + 'px';
  textarea.style.width = node.width() - node.padding() * 2 + 'px';
  textarea.style.height = node.height() - node.padding() * 2 + 5 + 'px';
  textarea.style.fontSize = node.fontSize() + 'px';
  textarea.style.border = 'none';
  textarea.style.padding = '0px';
  textarea.style.margin = '0px';
  textarea.style.overflow = 'hidden';
  textarea.style.background = 'none';
  textarea.style.outline = 'none';
  textarea.style.resize = 'none';
  textarea.style.lineHeight = node.lineHeight();
  textarea.style.fontFamily = node.fontFamily() || 'Arial';
  textarea.style.transformOrigin = 'left top';
  textarea.style.textAlign = node.align() || 'left';
  textarea.style.color = node.fill() || 'black';

  const rotation = node.rotation();
  let transform = '';
  if (rotation) {
    transform += 'rotateZ(' + rotation + 'deg)';
  }
  textarea.style.transform = transform;

  textarea.style.height = 'auto';
  textarea.style.height = textarea.scrollHeight + 3 + 'px';

  isEditing.value = true;
  textarea.focus();

  function removeTextarea() {
    if (textarea.parentNode) {
      textarea.parentNode.removeChild(textarea);
    }
    window.removeEventListener('click', handleOutsideClick);
    window.removeEventListener('touchstart', handleOutsideClick);
    isEditing.value = false;
  }

  function setTextareaWidth(newWidth) {
    if (!newWidth) {
      newWidth = node.placeholder?.length * node.fontSize() || 200;
    }
    textarea.style.width = newWidth + 'px';
  }

  textarea.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      emit('update:text', textarea.value);
      removeTextarea();
    }
    if (e.key === 'Escape') {
      removeTextarea();
    }
  });

  textarea.addEventListener('input', function () {
    const scale = node.getAbsoluteScale().x;
    setTextareaWidth(node.width() * scale);
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + node.fontSize() + 'px';
  });

  function handleOutsideClick(e) {
    if (e.target !== textarea) {
      emit('update:text', textarea.value);
      removeTextarea();
    }
  }

  setTimeout(() => {
    window.addEventListener('click', handleOutsideClick);
    window.addEventListener('touchstart', handleOutsideClick);
  }, 100);
}
</script>