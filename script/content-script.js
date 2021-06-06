console.log('--- Running in content-script.js ---')

chrome.runtime.onMessage.addListener(
  function(message, sender, sendResponse) {
    console.log(message)
    if (message.content != null && message.targetClass != null) {
      filterRows(message.content, message.targetClass)
    }
  }
)

function filterRows(table, index, filterInputValue) {
  filterInputValue = filterInputValue.trim()

  console.log(index)
  
  let tableID = table.getAttribute('data-tm-id')
  if (filterInputValue == '') {
    delete filterMap[tableID][index]
  } else {
    filterMap[tableID][index] = filterInputValue
  }

  let trs = table.querySelectorAll('tr')

  for (let i = 1; i < trs.length; i += 1) { // tr iteration
    // Start from the second?

    let tds = trs[i].querySelectorAll('td')
    let shouldHide = false

    for (let map in filterMap[tableID]) {
      content = tds[map].innerHTML
      if (content.indexOf(filterMap[tableID][map]) == -1) {
        // NOT find it
        shouldHide = true
      }
    }

    if (shouldHide) {
      trs[i].style.display = 'none'
    } else {
      trs[i].style.display = ''
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
let filterMap = {}
let tableIndex = 0

const highlightClass = 'tm-highlight-cells'
const maxTriggerRowsLength = 3

// --- Functions ---

function tableAdded(table) {
  console.log('tableAdded')

  let tableID = 'tm-id-' + Object.keys(filterMap).length
  table.setAttribute('data-tm-id', tableID)
  filterMap[tableID] = {}
}

// function trAdded(tr) {
//   console.log('trAdded')

//   tr.style.background = 'red'
// }

// function highlightClass(isTr, isHide) {
//   let highlightClassName = 'tm-highlight-cells'
//   if (isTr == undefined) {
//     return highlightClassName
//   }

//   return highlightClassName + (isHide ? '-hide' : '-visi') + (isTr ? '-tr' : '-td')
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

function filterRowsByKeyword(table, index, keyword, isRegex, isSensitive) {
  debounce(filterRows, 1000)(table, index, keyword)
}

function popOver(element, table, index) {
  let popOver = document.getElementById(`tm-popover-${index}`)
  if (popOver.getAttribute('class') === 'hidden') {
    // Show
    popOver.setAttribute("class", "show")

    let input = popOver.querySelector(`#tm-popover-${index}-input`)

    input.addEventListener('input', (event) => {
      filterRowsByKeyword(table, index, event.target.value, false, false)
      // console.log(event.target.value)
      if (event.target.value.trim() != '') {
        // Not empty
        element.innerHTML = "🔍"
      } else {
        element.innerHTML = "▼"
      }
    })
  } else {
    popOver.setAttribute("class", "hidden")
  }
}

function findAllTables(table) {
  let tables = table == undefined ? document.getElementsByTagName('table') : [table]

  for (let i = 0; i < tables.length; i += 1) {
    tableAdded(tables[i])
    observeTable(tables[i])
  }
}

function observeTable(table) {
  let containerClass = 'tm-mouse-over-container'

  function _disconnectThenRetry(observer, table) {
    observer.disconnect()   // Get first tr -> header
    observeTable(table) // Add it again
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

        event.target.style.position = 'relative';

        //add
        createPopoverForCell(cell, i)

        let div = document.createElement('div')
        div.setAttribute('class', containerClass)
        div.style.cssText = 'position: absolute; right: 0; top: 50%; transform: translateY(-50%); font-size: 14px;'
        div.appendChild(document.createTextNode('▼'))
        div.addEventListener('click', (event) => {
          console.log('click')

          // TODO
          popOver(event.target, table, i)
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
        if (divs[i].innerHTML != '🔍') {
          divs[i].parentNode.removeChild(divs[i])
        }
      }

      let highlights = table.getElementsByClassName(highlightClass)
      while (highlights.length > 0) {
        // highlights[0].style.background = ''
        highlights[0].classList.remove(highlightClass)
      }

      // event.target.style.background = ''
    }, false)
  } 
}

//add
function createPopoverForCell(cell, index) {
  if (cell.querySelector('#tm-popover-' + index) != null) {
    return
  }

  cell.innerHTML += `
      <div id="tm-popover-${index}" class="hidden" style="position: absolute;left: 50%;top: 0;transform: translate(-50%,-100%);z-index: 99;padding: 5px;">
          <div style="text-align: left;">
              <div style="background-color: #fff;background-clip: padding-box;border-radius: 2px;box-shadow: 0 3px 6px -4px rgb(0 0 0 / 12%), 0 6px 16px 0 rgb(0 0 0 / 8%), 0 9px 28px 8px rgb(0 0 0 / 5%);box-shadow: 0 0 8px rgba(0,0,0,.15)/9;">
                  <div style="margin: 0;padding: 8px 16px;color: rgba(0,0,0,.85);font-weight: 500;border-bottom: 1px solid #f0f0f0;display: flex;align-items: center;justify-content: space-between;">
                      <div>
                          请输入关键词
                      </div>
                      <div>
                          🔒
                      </div>
                  </div>
                  <div id="tm-popover-${index}-input" style="padding: 12px 16px;color: rgba(0,0,0,.85);">
                      <div style="border: 1px solid #000;padding: 5px;border-radius: 5px;">
                          <div style="display: flex;align-items: center;justify-content: space-between;">
                              <div>
                                  <input type="text" placeholder="filter key" name="" style="border: 0;height: 30px; outline:none;">
                              </div>
                              <div style="text-align: center; width: 25px;">
                                  Aa
                              </div>
                              <div style="text-align: center; width: 25px;">
                                  .*
                              </div>
                          </div>
                        </div>
                  </div>
              </div>
          </div>
      </div>
  `
}

function startObserveWebPage() {
  console.log('startObserveWebPage')

  // Find table that already loaded
  findAllTables()

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
          findAllTables(addedNode)
        } else if (addedNode.querySelectorAll != undefined) {
          // 2. Try to find inner <table>
          let tables = addedNode.querySelectorAll('table')
          for (let k = 0; k < tables.length; k += 1) {
            findAllTables(addedNode)
          }
        }
      }
    }
  })

  observer.observe(target, options)
}

window.onload = startObserveWebPage
