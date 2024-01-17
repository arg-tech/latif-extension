document.addEventListener('mouseup', function() {
    const selection = window.getSelection();
    if (!selection.rangeCount || selection.toString().trim() === '') return;

    const range = selection.getRangeAt(0);
    const highlightSpan = document.createElement('span');
    highlightSpan.classList.add('highlight-f44eb599-7a93-4deb-8f0f-0f899d72cf97');
    range.surroundContents(highlightSpan);
    selection.removeAllRanges();
});
