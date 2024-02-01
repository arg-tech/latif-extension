let minePageButton = document.getElementById('minePageButton');
minePageButton.addEventListener('click', function() {
    alert('Stub');
})

// Droppable table
let dropTable = document.getElementById('dropTable');

dropTable.addEventListener('dragover', function (event) {
    event.preventDefault(); // Prevent default to allow drop
});

dropTable.addEventListener('drop', function (event) {
    event.preventDefault(); // Prevent default action (open as link for some elements)
    let data = event.dataTransfer.getData('text/plain');

    // Add the dragged text to the table
    let newRow = dropTable.insertRow();
    newRow.insertCell();
    let newCell = newRow.insertCell();
    newRow.insertCell();
    let newText = document.createTextNode(data);
    newCell.appendChild(newText);
});
