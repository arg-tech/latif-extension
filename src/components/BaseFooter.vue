<script setup>
import InstagramIcon from 'bootstrap-icons/icons/instagram.svg'
import FacebookIcon from 'bootstrap-icons/icons/facebook.svg'
import TwitterIcon from 'bootstrap-icons/icons/twitter-x.svg'

const manifest = chrome.runtime.getManifest()
const version = manifest.version
</script>

<template>
  <footer class="container-fluid mt-4 py-3 bg-body-tertiary rounded-top-4">
    <div class="row mb-2">
      <div class="col text-start">
        <!-- using target value as blank so that the link opens in a new tab -->
        <a
          class="link-underline link-underline-opacity-0 link-secondary"
          href="https://latifproject.eu/"
          target="_blank"
          >LATIF Project</a
        >
      </div>

      <div class="col">
        <ul class="justify-content-end list-inline hstack gap-2 mb-0">
          <li>
            <a
              class="link-secondary p-1"
              href="https://www.instagram.com/ARG_tech/"
              target="_blank"
            >
              <InstagramIcon />
            </a>
          </li>
          <li>
            <a
              class="link-secondary p-1"
              href="https://www.facebook.com/ARGtechOrg/"
              target="_blank"
            >
              <FacebookIcon />
            </a>
          </li>
          <li>
            <a class="link-secondary p-1" href="https://x.com/arg_tech" target="_blank">
              <TwitterIcon />
            </a>
          </li>
        </ul>
      </div>
    </div>

    <div class="row text-body-secondary" style="font-size: 0.8rem">
      <div class="col-6">
        <span class=""> © 2024 ARG-tech<br /> </span>
      </div>

      <div class="col-6 text-end">
        <span>Version: {{ version }}</span>
      </div>
    </div>
  </footer>
</template>
