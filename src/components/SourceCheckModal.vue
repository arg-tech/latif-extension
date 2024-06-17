<template>
  <div
    class="modal fade"
    id="sourceCheckModal"
    tabindex="-1"
    aria-labelledby="sourceCheckModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5" id="sourceCheckModalLabel">
            Warning: Insufficient Evidence and Source Variety
          </h1>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Cancel"
          ></button>
        </div>
        <div class="modal-body">
          You are trying to generate a report which doesn't have either enough evidences, or all of
          your evidences are from the same source. Try doing:
          <ul>
            <li>Add more than two evidences in the table.</li>
            <li>Add more evidence from different sources (webpages).</li>
          </ul>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
          <button
            type="button"
            @click="$emit('continueAnyway')"
            data-bs-dismiss="modal"
            class="btn btn-primary"
          >
            Continue anyway
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
