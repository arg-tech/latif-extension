<script setup>
import { Modal } from 'bootstrap'
import { defineEmits, defineProps, onMounted, ref, watch } from 'vue'

const model = defineModel({ type: Boolean })

watch(model, (newModel) => {
  newModel === true ? modalObj.show() : modalObj.hide()
})

const props = defineProps({
  title: String,
  confirmButtonText: {
    type: String,
    default: 'Confirm'
  }
})

// 'confirm' is emitted when the confirm button is clicked.
// 'shown' is emitted once the modal has fully opened.
// This is useful for focusing any input boxes inside the modal.
const emits = defineEmits(['confirm', 'shown'])

const modalEl = ref(null)
let modalObj = null

onMounted(() => {
  modalObj = new Modal(modalEl.value)
})
</script>

<template>
  <Teleport to="body">
    <div
      ref="modalEl"
      class="modal fade"
      tabindex="-1"
      aria-labelledby="modalLabel"
      aria-hidden="true"
      v-on="{
        'hidden.bs.modal': () => {
          model = false
        },
        'shown.bs.modal': () => {
          emits('shown')
          model = true
        }
      }"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h1 class="modal-title fs-5" id="modalLabel">{{ props.title }}</h1>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body"><slot /></div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button @click="emits('confirm')" type="button" class="btn btn-primary">
              {{ props.confirmButtonText }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
