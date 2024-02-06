const example_article = "Some experts believe that Climate change is happening. There are plenty of reasons for it, but the most popular opinion is that governments are really slow, when it comes to reaction to the climate change. Other people claim that renewable energy is a scam that should be stopped.";

const example_get_claims = {
    "code": 200,
    "output": {
        "hypothesis": [
            "Some experts believe that Climate change is happening",
            "There are plenty of reasons for it, but the most popular opinion is that governments are really slow, when it comes to reaction to the climate change",
            "Other people claim that renewable energy is a scam that should be stopped"
        ]
    }
};

const example_analyze = {
    "hypothesis": [
        "Climate change is happening",
        "governments are really slow, when it comes to reaction to the climate change",
        "renewable energy is a scam"
    ],
    "manual_evidences": [
        "renewable energy sector generats plenty of jobs according to me",
        "the coal industry provides a lot of jobs as well",
        "there are a lot of money in wind, hydro electricity, solar panels to be made, with the benefits to humanity",
        "The level is rising for the last 3 decades, studies show",
        "The ocean level did not rise significantly",
        "Some countries deploy very strict regulations to the gas companies",
        "The limits are set for the amount of waste every country could emit",
        "Some countries are very slow to higher their ecology standards",
        "The amount of lifestock is getting bigger every year",
        "The President of the United States uses his plane very oftenly during his term",
        "The wind stations are on a rise",
        "The hydro stations do not provide enough electricity even for a small town of 1000 people",
        "The earth is not flat, but it is shaped as a banana",
        "Ipod was made from execcive amount of plastic"
    ],
    "max_alignment_limit": -1,
    "min_alignment_limit": -1
};


let minePageButton = document.getElementById('minePageButton');
minePageButton.addEventListener('click', function() {
    let tableHeader = document.getElementById('tableHeader');
    let claims = document.getElementById('page').appendChild(document.createElement('div'));
    claims.classList.add('mt-5');

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
});

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
