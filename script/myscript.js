// function delUnrelatedRows() {
	// console.log(config)

//     var rows = document.getElementsByClassName("mtd-table-row")
//     for (var i = 0; i<rows.length; i++) {
//         content = rows[i].getElementsByClassName("mtd-table-cell")[1].innerHTML
//         if (content.indexOf("骑行") == -1) {
//             console.log("----")
//             // rows[i].parentNode.removeChild(rows[i])
//             // i -= 1
// 			rows[i].style.display = 'none'
//         }
// //         return
//     }
// }

// window.onload = delUnrelatedRows;

var parent = document.getElementsByTagName("tbody")[0]

console.log("--------------")
console.log(parent)
console.log("myscript.js")

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(request.content)
    filterTableContent(request.content)
    // console.log(sender.tab ?
    //             "from a content script:" + sender.tab.url :
    //             "from the extension");
    // if (request.greeting == "hello")
    //   sendResponse({farewell: "goodbye"});
  }
);

function filterTableContent(filterInputValue) {
    var rows = document.getElementsByClassName("mtd-table-row")
    for (var i = 0; i<rows.length; i++) {
        content = rows[i].getElementsByClassName("mtd-table-cell")[1].innerHTML
        if (content.indexOf(filterInputValue) == -1) {
            // console.log("----")
            // rows[i].parentNode.removeChild(rows[i])
            // i -= 1
			    rows[i].style.display = 'none'
        } else {
			    rows[i].style.display = ''
        }
        // return
    }
}
