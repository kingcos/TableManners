console.log('--- Running in myscript.js ---')

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
