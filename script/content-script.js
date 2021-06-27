console.log('--- Running in content-script.js ---')

chrome.runtime.onMessage.addListener(
  function(message, sender, sendResponse) {
    console.log(message)
    if (message.content != null && message.targetClass != null) {
      filterRows(message.content, message.targetClass)
    }
  }
)

//添加css
// let style = document.createElement('style');
// style.type = 'text/css';
// style.innerHTML='.hidden{ display: none; } .show{ display: ''; }';
// document.getElementsByTagName('HEAD').item(0).appendChild(style);

// --- Generic Functions ---

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

// --- Variables ---
// let tableObservers = []

let headerMouseEnterTimer = null
let GlobalFilterMap = {}
let tableIndex = 0

const highlightClass = 'tm-highlight-cells'
const TriggerRowsMaxLength = 3
const TableAttKey = 'data-tm-id'

// --- Functions ---

observeAndEnhanceTables()
// window.onload = observeAndEnhanceTables

function observeAndEnhanceTables() {
  console.log('- observeAndEnhanceTables -')

  // Find table that already loaded
  initWithTables(document.getElementsByTagName('table'))

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
          initWithTables([addedNode])
        } else {
          if (addedNode.querySelectorAll != undefined) {
            // 2. Try to find inner <table>
            let tables = addedNode.querySelectorAll('table')
            if (tables.length > 0) {
              initWithTables(tables)
            }
          }
        }
      }
    }
  })

  observer.observe(target, options)
}

function initWithTables(tables) {
  for (let i = 0; i < tables.length; i += 1) {
    let table = tables[i]

    // if (table.getAttribute(TableAttKey) != null) {
    //   console.error('This should not happen.')
    //   continue
    // }

    // Special Tables Logic
    let theads = table.getElementsByTagName('thead')
    let tbodys = table.getElementsByTagName('tbody')
    if (theads.length == 1 && tbodys.length == 0
     && theads[0].childElementCount == 1
     && i < tables.length - 1) {
      // Only have thead (no tbody) && one <tr> && have next table
      i += 1

      let dataId = `tm-id-${Object.keys(GlobalFilterMap).length}`
      tables[i].setAttribute(TableAttKey, dataId)
      GlobalFilterMap[dataId] = {}

      enhanceTable(table, tables[i])
    } else {

      let dataId = `tm-id-${Object.keys(GlobalFilterMap).length}`
      tables[i].setAttribute(TableAttKey, dataId)
      GlobalFilterMap[dataId] = {}
  
      enhanceTable(table)

    }
  }
}

function enhanceTable(table, nextTable) {
  function _disconnectThenRetry(observer, table) {
    observer.disconnect() // Get the first tr as header
    enhanceTable(table)   // Retry
  }

  overrideOverflow(table)

  // if (table == null) { 
  //   console.error('This should not happen.')
  //   return
  // }

  let rows = table.querySelectorAll('tr')

  if (nextTable) {
    let head = rows[0]
    addIndicatorAndObserver(table, head, nextTable)

    return
  }

  if (rows.length < TriggerRowsMaxLength) {
    // rows lenth too less -> Observe once tr added for this table

    let options = { childList: true, subtree: true }
    let observer = new MutationObserver((mutations) => {
      for (let i = 0; i < mutations.length; i += 1) {
        let mutation = mutations[i]
  
        for (let j = 0; j < mutation.addedNodes.length; j += 1) {
          let addedNode = mutation.addedNodes[j]
          
          if (addedNode.nodeName.toLowerCase() == 'tr') {
            return _disconnectThenRetry(observer, table)
          } else if (addedNode.querySelectorAll != undefined
                  && addedNode.querySelectorAll('tr').length > 0) {
            return _disconnectThenRetry(observer, table)
          }
        }
      }
    })

    observer.observe(table, options)

    return
  }

  // --- Rows length is already satisified ---
  let head = rows[0]
  addIndicatorAndObserver(table, head)
}

function overrideOverflow(node) {
  if (!node.getAttribute) {
    return
  }

  // if (node.style.overflow == 'hidden') {
    node.style.overflow = 'visible'
  // }

  if (node.parentNode != null) {
    overrideOverflow(node.parentNode)
  }
}

function addIndicatorAndObserver(table, targetHeader, nextTable) {
  let containerClass = 'tm-mouse-over-container'
  // Add an indicator for header
  let cells = targetHeader.querySelectorAll('th, td')
  
  if (cells.length == 0) { return }

  for (let i = 0; i < cells.length; i += 1) {
    let cell = cells[i]

    // cell.style.background = 'red'

    // When mouse enter, wait then apply it
    cell.addEventListener('mouseenter', (event) => {
      headerMouseEnterTimer = setTimeout(() => {
        handleColumn(table, i)

        createPopoverForCell(nextTable ? nextTable : table, cell, i)

        let indicator = event.target.getElementsByClassName(containerClass)[0]
        if (!indicator) {
          indicator = document.createElement('div')
          indicator.setAttribute('class', containerClass)
          indicator.style.cssText = 'position: absolute; right: 0; top: 50%; z-index: 99; transform: translateY(-50%); font-size: 14px;'
          indicator.appendChild(document.createTextNode('▼'))
          event.target.appendChild(indicator)
          event.target.style.position = 'relative'
          indicator.addEventListener('click', (event) => {
            if (nextTable) {
              popOver(indicator, nextTable, event.target, i, true)
            } else {
              popOver(indicator, table, event.target, i)
            }
          })
        }
        indicator.style.display = ''
        
        event.target.style.position = 'relative'

        // event.target.style.background = 'red'
      }, 300)
    }, false)

    // When mouse out, recover it
    cell.addEventListener('mouseleave', (event) => {
      clearTimeout(headerMouseEnterTimer)

      // let indicators = event.target.getElementsByClassName(containerClass)
      // for (let i = 0; i < indicators.length; i += 1) {
      //   if (indicators[i].innerHTML != '🔍') {
      //     indicators[i].parentNode.removeChild(divs[i])
      //   }
      // }

      let indicator = event.target.getElementsByClassName(containerClass)[0]
      if (indicator && indicator.innerHTML && indicator.innerHTML != '🔍') {
        indicator.style.display = 'none'
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

function handleColumn(table, colIndex) {
  let rows = table.querySelectorAll('tr')

  // Skipped for the first line
  for (let i = 1; i < rows.length; i += 1) {
    let target = rows[i].querySelectorAll('th, td')[colIndex]
    if (target == undefined) {
      // Fixed for colspan
      continue
    }
    // target.style.background = 'red'
    target.classList.add(highlightClass)
  }
}

function createPopoverForCell(table, cell, index) {
  let tableID = table.getAttribute(TableAttKey)

  if (cell.querySelector(`#tm-popover-${index}-${tableID}`) != null) {
    return
  }

  cell.innerHTML += `
      <div id='tm-popover-${index}-${tableID}' class='tm-hide' style='position: absolute;left: 50%;top: 0;z-index: 99;padding: 5px; transform: translate(-50%,-100%); font-size: 14px;'>
        <style type="text/css">.tm-hide { display: none; } .tm-show { display: ''; }</style>
        <div style="text-align: left;">
            <div style="background-color: #fff;background-clip: padding-box;border-radius: 2px;box-shadow: 0 3px 6px -4px rgb(0 0 0 / 12%), 0 6px 16px 0 rgb(0 0 0 / 8%), 0 9px 28px 8px rgb(0 0 0 / 5%);box-shadow: 0 0 8px rgba(0,0,0,.15)/9;">
                <div id="tm-popover-${index}-input-${tableID}" style="padding: 12px 16px;color: rgba(0,0,0,.85);">
                    <div style="border: 1px solid #000;padding: 5px;border-radius: 5px;">
                        <div style="display: flex;align-items: center;justify-content: space-between;">
                            <div>
                                <input type="text" placeholder="请输入关键词开始过滤" name="" style="border: 0;height: 20px; outline:none;">
                            </div>
                        </div>
                      </div>
                </div>
            </div>
        </div>
    </div>
  `
}

function popOver(element, table, cell, index, isSpecial) {
  let tableID = table.getAttribute(TableAttKey)
  let popOver = document.getElementById(`tm-popover-${index}-${tableID}`)
  if (popOver.getAttribute('class') == 'tm-hide') {
    // Hide last
    let shownPopOvers = document.getElementsByClassName('tm-show')
    for (let i = 0; i < shownPopOvers.length; i += 1) {
      shownPopOvers[i].setAttribute('class', 'tm-hide')
    }
    
    // Show
    if (element.innerText == '▼') {
      element.innerText = '▲'
    }
    popOver.setAttribute('class', 'tm-show')

    let input = popOver.querySelector(`#tm-popover-${index}-input-${tableID}`)

    input.addEventListener('input', (event) => {
      filterRowsByKeyword(table, index, event.target.value, false, false, isSpecial)
      // console.log(event.target.value)
      if (event.target.value.trim() != '') {
        // Not empty
        element.innerHTML = '🔍'
      } else {
        element.innerHTML = '▲'
      }
    })
  } else {
    if (element.innerText == '▲') {
      element.innerText = '▼'
    }
    popOver.setAttribute('class', 'tm-hide')
  }
}

function filterRowsByKeyword(table, index, keyword, isRegex, isSensitive, isSpecial) {
  debounce(filterRows, 1000)(table, index, keyword, isSpecial)
}

function filterRows(table, index, filterInputValue, isSpecial) {
  filterInputValue = filterInputValue.trim()

  console.log(index)
  
  let tableID = table.getAttribute(TableAttKey)
  if (filterInputValue == '') {
    delete GlobalFilterMap[tableID][index]
  } else {
    GlobalFilterMap[tableID][index] = filterInputValue
  }

  let trs = table.querySelectorAll('tr')

  for (let i = isSpecial ? 0 : 1; i < trs.length; i += 1) { // tr iteration
    // Start from the second?

    let tds = trs[i].querySelectorAll('td')
    let shouldHide = false

    for (let map in GlobalFilterMap[tableID]) {
      content = tds[map].innerText
      if (content.indexOf(GlobalFilterMap[tableID][map]) == -1) {
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