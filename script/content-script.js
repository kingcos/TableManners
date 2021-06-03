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
  console.log(filterInputValue)
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

// -----------



// --- Generic Functions ---

// --- Variables ---
// let tableObservers = []

let headerMouseEnterTimer = null
let highlightClass = 'tm-highlight-cells'
let maxTriggerRowsLength = 3

// --- Functions ---

function tableAdded(table) {
  console.log('tableAdded')

  findAllTables(table)
}

// function trAdded(tr) {
//   console.log('trAdded')

//   tr.style.background = 'red'
// }

function highlightColumn(table, cell) {
  let cells = table.querySelectorAll(cell.nodeName.toLowerCase())
  let num = Array.prototype.indexOf.call(cells, cell)
  let rows = table.querySelectorAll('tr')

  for (let i = 1; i < rows.length; i += 1) {
    let target = rows[i].querySelectorAll('th, td')[num]
    if (target == undefined) {
      // Fixed for colspan
      continue
    }
    // target.style.background = 'red'
    target.classList.add(highlightClass)
  }
}

let timerId = null

function debounce(fn, wait) {
  let callback = fn

  function debounced() {
      // 保存作用域
      let context = this
      // 保存参数，例如 event 对象
      let args = arguments

      clearTimeout(timerId)
      timerId = setTimeout(function() {            
          callback.apply(context, args)
      }, wait)
  }
  
  // 返回一个闭包
  return debounced  
}

function filterRowsByKeyword(keyword, isRegex, isSensitive) {
  debounce(filterRows, 1000)(keyword, highlightClass)
}

function popOver(element) {
  let div = document.createElement('div')
  let input = document.createElement('input')

  input.type = 'text'
  input.placeholder = 'Filter'
  input.id = 'tm-input-filter'
  input.style.cssText = 'color: black; width: 80%; height: 30px; font-size: 14px;'

  div.appendChild(input)
  element.parentNode.appendChild(div)

  input.addEventListener('input', (event) => {
    filterRowsByKeyword(event.target.value, false, false)
    // console.log(event.target.value)
  })

  // const popperInstance = Popper.createPopper(element, div)
  // popperInstance.update();
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

function addArrowForTable(table) {
  let containerClass = 'tm-mouse-over-container'

  function _disconnectThenRetry(observer, table) {
    observer.disconnect()   // Get first tr -> header
    addArrowForTable(table) // Add it again
  }

  if (table == null) { return }

  let rows = table.querySelectorAll('tr')
  if (rows.length < maxTriggerRowsLength) {
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

    // When mouse enter, wait then apply it
    cell.addEventListener('mouseenter', (event) => {
      headerMouseEnterTimer = setTimeout(() => {
        highlightColumn(table, event.target)

        event.target.style.position = 'relative'

        let div = document.createElement('div')
        div.setAttribute('class', containerClass)
        div.style.cssText = 'position: absolute; right: 0; top: 50%; transform: translateY(-50%); font-size: 14px;'
        div.appendChild(document.createTextNode('⬇️'))
        div.addEventListener('click', (event) => {
          console.log('click')

          // TODO
          popOver(event.target)
        })
        event.target.appendChild(div)

        // event.target.style.background = 'red'
      }, 300)
    }, false)

    // When mouse out, recover it
    cell.addEventListener('mouseleave', (event) => {
      clearTimeout(headerMouseEnterTimer)

      let divs = event.target.getElementsByClassName(containerClass)
      for (let i = 0; i < divs.length; i += 1) {
        divs[i].parentNode.removeChild(divs[i])
      }

      let highlights = table.getElementsByClassName(highlightClass)
      for (let i = 0; i < highlights.length; i += 1) {
        // highlights[i].style.background = ''
        highlights[i].classList.remove(highlightClass)
      }

      // event.target.style.background = ''
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
