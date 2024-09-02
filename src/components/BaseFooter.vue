<script setup>
import InstagramIcon from 'bootstrap-icons/icons/instagram.svg'
import FacebookIcon from 'bootstrap-icons/icons/facebook.svg'
import TwitterIcon from 'bootstrap-icons/icons/twitter.svg'

const manifest = chrome.runtime.getManifest()
const version = manifest.version
</script>

<template>
  <footer class="d-flex flex-wrap justify-content-between align-items-center mt-2 border-top">
    <div class="col-md-4 d-flex align-items-center">
      <a href="/" class="mb-3 me-2 mb-md-0 text-body-secondary text-decoration-none lh-1"></a>
      <!-- using target value as blank so that the link opens in a new tab -->
      <span class="mb-3 mb-md-0 mt-3 text-body-secondary">
        © 2024 ARG-tech<br />
        <a href="https://latifproject.eu/" target="_blank">LATIF Project</a>
      </span>
    </div>

    <span>Version: {{ version }}</span>

    <ul class="nav col-md-4 me-4 justify-content-end list-unstyled d-flex">
      <li class="ms-3">
        <a class="text-body-secondary" href="https://www.instagram.com/ARG_tech/" target="_blank">
          <InstagramIcon />
        </a>
      </li>
      <li class="ms-3">
        <a class="text-body-secondary" href="https://www.facebook.com/ARGtechOrg/" target="_blank">
          <FacebookIcon />
        </a>
      </li>
      <li class="ms-3">
        <a class="text-body-secondary" href="https://twitter.com/arg_tech" target="_blank">
          <TwitterIcon />
        </a>
      </li>
    </ul>
  </footer>
</template>
