// Allows users to open the side panel by clicking on the action toolbar icon
// Uses async IIFE, to use top-level await without using modules.
(async () => {
  try {
    await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
  } catch (error) {
    console.error('Error setting panel behavior:', error);
  }
})();