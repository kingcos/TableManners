console.log('--- Running in filter.js ---')

// let ActionEnum = {
//   FILTER: 'FILTER'
// }

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    // if (request.action == ActionEnum.FILTER) {
      filterRows(request.content)
    // }
  }
)

function filterRows(filterInputValue) {
    var rows = document.getElementsByClassName('mtd-table-row')
    for (var i = 0; i < rows.length; i += 1) {
        content = rows[i].getElementsByClassName('mtd-table-cell')[1].innerHTML
        if (content.indexOf(filterInputValue) == -1) {
            // rows[i].parentNode.removeChild(rows[i])
            // i -= 1
			      rows[i].style.display = 'none'
        } else {
			      rows[i].style.display = ''
        }
    }
}

// chrome.runtime.onMessage.addListener(
//   function(request, sender, sendResponse) {
//     console.log(request.action)
//   }
// )
