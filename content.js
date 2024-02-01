document.addEventListener('mouseup', function() {
    const selection = window.getSelection();
    if (!selection.rangeCount || selection.toString().trim() === '') return;

    const range = selection.getRangeAt(0);
    const highlightSpan = document.createElement('span');
    highlightSpan.classList.add('highlight-f44eb599-7a93-4deb-8f0f-0f899d72cf97');
    highlightSpan.setAttribute('draggable', true)

    const highlightedText = selection.toString();

    highlightSpan.addEventListener('dragstart', function (event) {
        event.dataTransfer.setData('text/plain', highlightedText);
    });

    range.surroundContents(highlightSpan);
    selection.removeAllRanges();
});

// select the item element
const item = document.querySelector('.item');

// attach the dragstart event handler
// item.addEventListener('dragstart', dragStart);

// handle the dragstart

function dragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.id);
}

