console.log('--- Running in content-script.js ---')

chrome.runtime.onMessage.addListener(
  function(message, sender, sendResponse) {
    console.log(message)
    if (message.content != null && message.targetClass != null) {
      filterRows(message.content, message.targetClass)
    }
  }
)

function filterRows(filterInputValue, targetClass) {
  var tds = document.getElementsByClassName(targetClass)
  for (var i = 0; i < tds.length; i += 1) {
    content = tds[i].innerHTML
    if (content.indexOf(filterInputValue) == -1) {
      tds[i].parentNode.style.display = 'none'
      // tds[i].parentNode.style.background = 'red'
    } else {
      tds[i].parentNode.style.display = ''
    }
  }  
}

// function filterRows(filterInputValue) {
//     var rows = document.getElementsByClassName('mtd-table-row')
//     for (var i = 0; i < rows.length; i += 1) {
//         content = rows[i].getElementsByClassName('mtd-table-cell')[1].innerHTML
//         if (content.indexOf(filterInputValue) == -1) {
//             // rows[i].parentNode.removeChild(rows[i])
//             // i -= 1
// 			      rows[i].style.display = 'none'
//         } else {
// 			      rows[i].style.display = ''
//         }
//     }
// }

// chrome.runtime.onMessage.addListener(
//   function(request, sender, sendResponse) {
//     console.log(request.action)
//   }
// )

function tableAdded(table) {
  console.log('tableAdded')

  findAllTables(table)
}

function trAdded(tr) {
  console.log('trAdded')

  tr.style.background = 'red'
}

function findAllTables(table) {
  let tables
  if (table != null) {
    tables = [table]
  } else {
    tables = document.getElementsByTagName('table')
  }

  for (let i = 0; i < tables.length; i += 1) {
    addArrowForTable(tables[i])
  }
}

// let tableObservers = []

function addArrowForTable(table) {
  function _disconnectThenRetry(observer, table) {
    observer.disconnect()   // Get first tr -> header
    addArrowForTable(table) // Add it again
  }
  if (table == null) { return }

  let rows = table.querySelectorAll('tr')
  if (rows.length == 0) {
    // No entires -> Observe once tr added for this table

    let options = { childList: true, subtree: true }
    let observer = new MutationObserver((mutations) => {
      // console.log(mutations)
      for (let i = 0; i < mutations.length; i += 1) {
        let mutation = mutations[i]
  
        for (let j = 0; j < mutation.addedNodes.length; j += 1) {
          let addedNode = mutation.addedNodes[j]
          
          if (addedNode.nodeName.toLowerCase() == 'tr') {
            return _disconnectThenRetry(observer, table)
          } else if (addedNode.querySelectorAll != undefined) {
            let trs = addedNode.querySelectorAll('tr')
            if (trs.length > 0) {
              return _disconnectThenRetry(observer, table)
            }
          }
        }
      }
    })

    observer.observe(table, options)

    return
  }

  // Add arrow for first row
  let head = rows[0]
  let cells = head.querySelectorAll('th, td')
  if (cells.length == 0) { return }

  for (let i = 0; i < cells.length; i += 1) {
    let cell = cells[i]

    cell.addEventListener('mouseenter', (event) => {
      event.target.style.background = 'red'

      // event.target.innerHTML += '<div style="position: fixed; z-index: 99; right: 0; top: 50%; transform: translateY(-50%)"><div>嘻嘻嘻</div></div>'
    }, false)

    cell.addEventListener('mouseout', (event) => {
      event.target.style.background = ''
    }, false)
  } 
}

function startObserveWebPage() {
  console.log('startObserveWebPage')

  // Find table that already loaded
  findAllTables(null)

  // Observe new table inserted
  let target = document.getElementsByTagName('body')[0]
  let options = { childList: true, subtree: true }
  let observer = new MutationObserver((mutations) => {
    // console.log(mutations)
    for (let i = 0; i < mutations.length; i += 1) {
      let mutation = mutations[i]

      for (let j = 0; j < mutation.addedNodes.length; j += 1) {
        let addedNode = mutation.addedNodes[j]

        // 1. Try to find added <table>
        if (addedNode.nodeName.toLowerCase() == 'table') {
          tableAdded(addedNode)
        } else if (addedNode.querySelectorAll != undefined) {
          // 2. Try to find inner <table>
          let tables = addedNode.querySelectorAll('table')
          for (let k = 0; k < tables.length; k += 1) {
            tableAdded(tables[k])
          }
        }
      }
    }
  })

  observer.observe(target, options)
}

window.onload = startObserveWebPage