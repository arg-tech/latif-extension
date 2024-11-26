<script setup>
import { useStore } from '@/store'
import BaseButton from '@/components/BaseButton.vue'
import UndoIcon from 'bootstrap-icons/icons/arrow-counterclockwise.svg'
import RedoIcon from 'bootstrap-icons/icons/arrow-clockwise.svg'
import SaveIcon from 'bootstrap-icons/icons/floppy.svg'
import LoadIcon from 'bootstrap-icons/icons/folder.svg'
import HelpIcon from 'bootstrap-icons/icons/info-lg.svg'

const store = useStore()
</script>

<template>
  <div class="d-flex gap-1">
    <BaseButton @click="store.undo"><UndoIcon class="p-0 align-self-center" />Undo</BaseButton>
    <BaseButton @click="store.redo"><RedoIcon />Redo</BaseButton>
    <BaseButton @click="store.save" tooltip="Save the table to a file">
      <SaveIcon />Save
    </BaseButton>
    <BaseButton @click="store.load" tooltip="Load a previously saved file">
      <LoadIcon />Load
    </BaseButton>
    <a href="https://latif.arg.tech" target="_blank">
      <BaseButton><HelpIcon /> Help</BaseButton>
    </a>
  </div>
</template>
