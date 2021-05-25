// // Initialize button with user's preferred color
// let changeColor = document.getElementById("changeColor");

// chrome.storage.sync.get("color", ({ color }) => {
//   changeColor.style.backgroundColor = color;
// });

// // When the button is clicked, inject setPageBackgroundColor into current page
// changeColor.addEventListener("click", async () => {
// 	let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

// 	chrome.scripting.executeScript({
// 		target: { tabId: tab.id },
// 		function: setPageBackgroundColor,
// 	});
// });
  
// // The body of this function will be executed as a content script inside the
// // current page
// function setPageBackgroundColor() {
// chrome.storage.sync.get("color", ({ color }) => {
// 		document.body.style.backgroundColor = color;
// 	});
// }

// 过滤按钮
let getTablesButton = document.getElementById("getTablesButton")
document.getElementById("getTablesButton").addEventListener("click", async () => {
    console.log("getTablesButton")

    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

	chrome.scripting.executeScript({
		target: { tabId: tab.id },
		files: ['script/myscript.js']
	}, () => {
        // window.postMessage({ type: "FROM_PAGE", text: "Hello from the webpage!" }, "*");
        // chrome.tabs.sendMessage(tab.id, filterInputValue);
        console.log(filterInputValue)
        chrome.tabs.sendMessage(tab.id, {content: filterInputValue});
    })
    
  }, false);


// getTablesButton.addEventListener("click", async (e) => {
//     window.postMessage({ type: "FROM_PAGE", text: "Hello from the webpage!" }, "*");

//     // chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
//     //     chrome.tabs.update(tabs[0].id, {url: "https://www.baidu.com"});
//     // });

//     // let [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

// 	// chrome.scripting.executeScript({
// 	// 	target: { tabId: tab.id },
// 	// 	files: ['script/myscript.js']
// 	// }, () => {
//     //     chrome.tabs.sendMessage(tab.id, filterInputValue);
//     // })
// });

function fetchAllTables() {
    var parent = document.getElementsByTagName("tbody")[0]

	console.log("--------------")
	console.log(parent)

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
}

// 文本框
let filterInput = document.getElementById("filter-input")
var filterInputValue = ""

filterInput.addEventListener("input", async (value) => {
    filterInputValue = value.target.value
    console.log(filterInputValue)

    // let [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

	// chrome.scripting.executeScript({
	// 	target: { tabId: tab.id },
	// 	function: filterTableContent,
	// });
});

// function filterTableContent() {
//     var rows = document.getElementsByClassName("mtd-table-row")
//     for (var i = 0; i<rows.length; i++) {
//         content = rows[i].getElementsByClassName("mtd-table-cell")[1].innerHTML
//         if (content.indexOf(filterInputValue) == -1) {
//             console.log("----")
//             // rows[i].parentNode.removeChild(rows[i])
//             // i -= 1
// 			rows[i].style.visibility = 'hidden'
//         } else {
// 			rows[i].style.visibility = 'visible'
//         }
// //         return
//     }
// }
