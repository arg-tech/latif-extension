<script setup>
import { Modal } from 'bootstrap'
import { defineEmits, defineProps, onMounted, ref, watch } from 'vue'

defineExpose({ show: _show, hide: _hide })

const model = defineModel({ type: Boolean, default: undefined })

watch(model, (newModel) => {
  newModel === true ? _show() : _hide()
})

const props = defineProps({
  title: String,
  confirmButtonText: {
    type: String,
    default: 'Confirm'
  }
})

const emits = defineEmits(['confirm', 'hidden.bs.modal', 'shown.bs.modal'])

const modalEl = ref(null)
let modalObj = null

onMounted(() => {
  modalObj = new Modal(modalEl.value)
  if (model.value === undefined) {
    modalObj.show()
  }
})

function _show() {
  modalObj.show()
}

function _hide() {
  modalObj.hide()
}
</script>

<template>
  <Teleport to="body">
    <div
      ref="modalEl"
      class="modal fade"
      id="modal"
      tabindex="-1"
      aria-labelledby="modalLabel"
      aria-hidden="true"
      v-on="{
        'hidden.bs.modal': () => {
          emits('hidden.bs.modal')
          model = false
        },
        'shown.bs.modal': () => {
          emits('shown.bs.modal')
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
