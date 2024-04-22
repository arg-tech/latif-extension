addEventListener('DOMContentLoaded', () => {
  let analyzeResponse

  document.getElementById('reportGenerationButton').addEventListener('click', async function () {
    // Add spinner to Report generation button once clicked.
    let spinner = document.createElement('span')
    spinner.className = 'spinner-border spinner-border-sm ms-2'
    spinner.ariaHidden = true
    document.getElementById('reportGenerationButton').appendChild(spinner)

    // Used for debugging the API response.
    let report

    // The other option here is: generate_per_claim_articles
    await fetch('http://178.79.182.88:8000/generate_check_result_article/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(analyzeResponse.output)
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
        return response.json()
      })
      .then((response) => {
        report = response
        response = response.output.article
        let textBlob = new Blob([response], { type: 'text/plain' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(textBlob)
        link.download = 'report' // Filename
        link.click()
        URL.revokeObjectURL(link.href)
      })
      .catch((error) => {
        console.error('Error downloading file:', error)
      })

    console.log(report.output)

    // Remove "loading" spinner from the button by resetting the text back to its original state.
    document.getElementById('reportGenerationButton').innerHTML = 'Generate report'
  })

  function displayScrollBar(event) {
    event.preventDefault()
    // Find place in page to put slider after.
    let analyzeButtonDiv = document.getElementById('analyzeButton')
    analyzeButtonDiv = analyzeButtonDiv.parentElement

    let sliderDiv = document.createElement('div')
    let displayBar = document.createElement('input')
    displayBar.setAttribute('type', 'range')
    // displayBar.setAttribute("class", "form-range");
    displayBar.setAttribute('list', 'values')
    displayBar.setAttribute('min', '-1')
    displayBar.setAttribute('max', '1')
    displayBar.setAttribute('id', 'rangeInput')
    displayBar.setAttribute('step', '0.01')
    let dataList = document.createElement('datalist')
    dataList.id = 'values'
    let label = ['low', 'medium', 'high']
    for (let i = -1; i <= 1; i++) {
      let tickMark = document.createElement('option')
      tickMark.setAttribute('value', i)
      tickMark.setAttribute('label', label[i + 1])
      dataList.appendChild(tickMark)
    }

    sliderDiv.append(displayBar)
    sliderDiv.append(dataList)
    analyzeButtonDiv.after(sliderDiv)
  }

  // Comment out heatmap slider so that we don't get errors showing up in our extension.
  // const colorInput = document.getElementById('colorInput');
  // const rangeInput = document.getElementById('rangeInput');

  // rangeInput.addEventListener('input', updateColour);

  // function updateColour() {
  //     const hue = (rangeInput.value / 100) * 120; // Map the range value to a hue value between 0 and 120
  //     const color = `hsl(${hue}, 100%, 50%)`;

  //     colorInput.value = color;
  //     colorInput.style.backgroundColor = color;
  // }
})
