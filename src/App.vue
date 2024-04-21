<script setup>
import PageFooter from './components/PageFooter.vue'
</script>

<template>
  <main id="page" class="container-fluid mt-2 flex-grow-1">
    <div class="d-flex mb-4">
      <h1 class="me-auto">Impartial Fact Checker</h1>
      <a href="https://www.arg.tech/" target="_blank"
        ><img
          class="img-fluid me-2"
          src="/icon128.png"
          alt="ARG-tech logo"
          style="width: 40px; height: 40px"
      /></a>
    </div>
    <div class="d-grid gap-2">
      <button type="button" id="minePageButton" class="btn btn-primary">Mine webpage</button>
    </div>
    <table class="table table-bordered mt-3" id="dropTable">
      <thead>
        <tr id="tableHeader">
          <th>#</th>
        </tr>
      </thead>
      <tbody></tbody>
    </table>
    <div class="d-grid gap-2">
      <button type="button" id="analyzeButton" class="btn btn-primary">Analyze ACH Table</button>
    </div>
    <div class="d-grid gap-2 mt-3">
      <button type="button" id="reportGenerationButton" class="btn btn-primary">
        Generate report
      </button>
    </div>
  </main>

  <PageFooter></PageFooter>
</template>

<style scoped>
header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
