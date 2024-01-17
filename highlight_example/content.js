document.addEventListener('mouseup', function() {
    const selection = window.getSelection();
    if (!selection.rangeCount || selection.toString().trim() === '') return;

    const range = selection.getRangeAt(0);
    const highlightSpan = document.createElement('span');
    highlightSpan.classList.add('highlight');
    range.surroundContents(highlightSpan);
    selection.removeAllRanges();
});
