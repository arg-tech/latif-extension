const example_article = "Some experts believe that Climate change is happening. There are plenty of reasons for it, but the most popular opinion is that governments are really slow, when it comes to reaction to the climate change. Other people claim that renewable energy is a scam that should be stopped.";

let example_get_claims;

let example_analyze;

let manual_evidences = [];


let minePageButton = document.getElementById('minePageButton');
minePageButton.addEventListener('click', async function() {
    // Add spinner to Mine webpage button once clicked.
    let spinner = document.createElement('span');
    spinner.className = 'spinner-border spinner-border-sm ms-2';
    spinner.ariaHidden = true;
    minePageButton.appendChild(spinner);

    let tableHeader = document.getElementById('tableHeader');
    let claims = document.getElementById('page').appendChild(document.createElement('div'));
    claims.classList.add('mt-5');

    // Fetch page data from the API.
    example_get_claims = await fetch('http://178.79.182.88:8080/get_claims/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            text: example_article,
        }),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            return data;
        })
        .catch(error => {
            console.error('There has been a problem with your fetch operation:', error);
        });

    // Update table with claims mined from webpage.
    for (let index = 0; index < example_get_claims.output.hypothesis.length; index++) {
        // Add to table header
        let columnHeader = document.createElement('th');
        let hypothesisCount = document.createTextNode("H" + (index + 1));

        columnHeader.appendChild(hypothesisCount);
        tableHeader.appendChild(columnHeader);

        // Add claims to bottom of page
        let claim = document.createElement('p');
        claim.innerHTML = "<strong>H" + (index + 1) + ": </strong>" + example_get_claims.output.hypothesis[index];
        claims.appendChild(claim);
    }

    // Remove "loading" spinner from the button by resetting the text back to Mine webpage.
    minePageButton.innerHTML = 'Mine webpage';
});

document.getElementById('analyzeButton').addEventListener('click', async function (event) {
    console.log({
        "hypothesis": example_get_claims.output.hypothesis,
        "manual_evidences": manual_evidences,
        "max_alignment_limit": -1,
        "min_alignment_limit": -1
    });
    // Fetch page data from the API.
    example_analyze = await fetch('http://178.79.182.88:8080/analyze/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            "hypothesis": example_get_claims.output.hypothesis,
            "manual_evidences": manual_evidences,
            "max_alignment_limit": -1,
            "min_alignment_limit": -1
        }),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            return data;
        })
        .catch(error => {
            console.error('There has been a problem with your fetch operation:', error);
        });

    console.log(example_analyze);
});

// Droppable table
let dropTable = document.getElementById('dropTable');

dropTable.addEventListener('dragover', function (event) {
    event.preventDefault(); // Prevent default to allow drop
});

dropTable.addEventListener('drop', function (event) {
    event.preventDefault(); // Prevent default action (open as link for some elements)
    let data = event.dataTransfer.getData('text/plain');

    manual_evidences.push(data);

    // Add the dragged text to the table
    let newRow = dropTable.insertRow();
    let newCell = newRow.insertCell();
    let newText = document.createTextNode(data);
    newCell.appendChild(newText);

    // Ensure the table doesn't look cut off on this row.
    for (let index = 0; index < example_get_claims.output.hypothesis.length; index++) {
        let cell = newRow.insertCell();
        let colourNode = document.createElement("input");
        colourNode.setAttribute("type", "color");
        colourNode.classList.add("form-control");
        colourNode.setAttribute("value", "#ff0000")
        colourNode.addEventListener("click", displayScrollBar);
        cell.appendChild(colourNode);
    }

    function displayScrollBar(event){
        event.preventDefault();
        let page = document.getElementById("page");
        let displayBar = document.createElement("input");
        displayBar.setAttribute("type", "range");
        displayBar.setAttribute("class", "form-range");
        page.appendChild(displayBar);
    }

});
