<template>
  <v-text
    :config="{
      ...props.textElement.getKonvaConfig(),
      visible: !isEditing,
    }"
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

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { TextElement } from '../models/TextElement'
import type { KonvaNode } from '../types/konva'

const props = defineProps<{
  textElement: TextElement
  isSelected: boolean
}>()

const emit = defineEmits<{
  select: []
  'drag-start': []
  'drag-end': [{ x: number, y: number }]
  transform: [{ width: number, height: number }]
  'elementUpdated': [TextElement]
}>()

// Fix text rendering issue in Konva
if (window.Konva) {
  window.Konva._fixTextRendering = true;
}

console.log('EditableText component mounted with:', props.textElement)

const isEditing = ref(false)
const textNode = ref<KonvaNode | null>(null)

// Use the transformer config from the class
const transformerConfig = props.textElement.getTransformerConfig()

function setTextRef(el: any) {
  textNode.value = el?.getNode?.() || null
}

function handleClick() {
  emit('select')
}



function handleDragStart() {
  props.textElement.handleDragStart(() => emit('drag-start'))
}

function handleDragEnd(evt: any) {
  props.textElement.handleDragEnd(evt, (element) => emit('elementUpdated', element))
}

function handleTransform(e: any) {
  props.textElement.handleTransform(e, textNode.value, (element) => emit('elementUpdated', element))
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

  textarea.value = props.textElement.text;
  textarea.style.position = 'absolute';
  textarea.style.top = areaPosition.y + 'px';
  textarea.style.left = areaPosition.x + 'px';
  textarea.style.width = node.width() - node.padding() * 2 + 'px';
  textarea.style.height = node.height() - node.padding() * 2 + 5 + 'px';
  textarea.style.fontSize = props.textElement.fontSize + 'px';
  textarea.style.border = 'none';
  textarea.style.padding = '0px';
  textarea.style.margin = '0px';
  textarea.style.overflow = 'hidden';
  textarea.style.background = 'none';
  textarea.style.outline = 'none';
  textarea.style.resize = 'none';
  textarea.style.lineHeight = String(node.lineHeight());
  textarea.style.fontFamily = props.textElement.fontFamily || 'Arial';
  textarea.style.transformOrigin = 'left top';
  textarea.style.textAlign = 'left';
  textarea.style.color = props.textElement.fill || 'black';

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

  function setTextareaWidth(newWidth: number) {
    if (!newWidth) {
      newWidth = props.textElement.text.length * props.textElement.fontSize || 200;
    }
    textarea.style.width = newWidth + 'px';
  }

  textarea.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      // Update the text element
      props.textElement.text = textarea.value;
      emit('elementUpdated', props.textElement);
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
    textarea.style.height = textarea.scrollHeight + props.textElement.fontSize + 'px';
  });

  function handleOutsideClick(e: any) {
    if (e.target !== textarea) {
      // Update the text element
      props.textElement.text = textarea.value;
      emit('elementUpdated', props.textElement);
      removeTextarea();
    }
  }

  setTimeout(() => {
    window.addEventListener('click', handleOutsideClick);
    window.addEventListener('touchstart', handleOutsideClick);
  }, 100);
}
</script>