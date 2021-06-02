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
  var tables
  if (table != null) {
    tables = [table]
  } else {
    tables = document.getElementsByTagName('table')
  }

  for (var i = 0; i < tables.length; i += 1) {
    addArrowForTable(tables[i])
  }
}

var tableObservers = []

function addArrowForTable(table) {
  if (table == null) { return }

  var rows = table.querySelectorAll('tr')
  if (rows.length == 0) {
    // No entires -> Observe it

    let options = { childList: true, subtree: true }
    let observer = new MutationObserver((mutations) => {
      // console.log(mutations)
      for (var i = 0; i < mutations.length; i += 1) {
        var mutation = mutations[i]
  
        for (var j = 0; j < mutation.addedNodes.length; j += 1) {
          var addedNode = mutation.addedNodes[j]
          
          if (addedNode.nodeName.toLowerCase() == 'tr') {
            observer.disconnect() // Get first tr -> header

            addArrowForTable(table)

            return
          } else if (addedNode.querySelectorAll != undefined) {
            var trs = addedNode.querySelectorAll('tr')
            if (trs.length > 0) {
              observer.disconnect() // Get first tr -> header

              addArrowForTable(table)

              return
            }
          }
        }
      }
    })

    observer.observe(table, options)
  } else {
    rows[0].style.background = 'red'
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
    for (var i = 0; i < mutations.length; i += 1) {
      var mutation = mutations[i]

      for (var j = 0; j < mutation.addedNodes.length; j += 1) {
        var addedNode = mutation.addedNodes[j]

        // 1. Try to find added <table>
        if (addedNode.nodeName.toLowerCase() == 'table') {
          tableAdded(addedNode)
        } else if (addedNode.querySelectorAll != undefined) {
          // 2. Try to find inner <table>
          var tables = addedNode.querySelectorAll('table')
          for (var k = 0; k < tables.length; k += 1) {
            tableAdded(tables[k])
          }
        }
      }
    }
  })

  observer.observe(target, options)
}

window.onload = startObserveWebPage