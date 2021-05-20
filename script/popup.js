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

let getTablesButton = document.getElementById("getTablesButton")

getTablesButton.addEventListener("click", async (e) => {
    // chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
    //     chrome.tabs.update(tabs[0].id, {url: "https://www.baidu.com"});
    // });

    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

	chrome.scripting.executeScript({
		target: { tabId: tab.id },
		function: fetchAllTables(e),
	});
});

let filterInput = document.getElementById("filter-input")
var filterInputValue = ""

filterInput.addEventListener("input", async (value) => {
    filterInputValue = value

    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

	chrome.scripting.executeScript({
		target: { tabId: tab.id },
		function: filterTableContent,
	});
});

function filterTableContent() {
    var rows = document.getElementsByClassName("mtd-table-row")
    for (var i = 0; i<rows.length; i++) {
        content = rows[i].getElementsByClassName("mtd-table-cell")[1].innerHTML
        if (content.indexOf(filterInputValue) == -1) {
            console.log("----")
            // rows[i].parentNode.removeChild(rows[i])
            // i -= 1
			rows[i].style.visibility = 'hidden'
        } else {
			rows[i].style.visibility = 'visible'
        }
//         return
    }
}

function getTables() {
	
	
    chrome.storage.sync.get("tablesCount", ({ tablesCount }) => {
        console.log('表格数量', `${tablesCount}`);
	});
}

function deleteRowsByKeyword(keyword) {
    var parent = document.getElementsByTagName("tbody")[0]
    var rows = document.getElementsByClassName("mtd-table-row")
    for (var i = 0; i<rows.length; i++) {
        content = rows[i].getElementsByClassName("mtd-table-cell")[1].innerHTML
        if (content.indexOf(keyword) == -1) {
            rows[i].parentNode.removeChild(rows[i])
            i -= 1
        }
    }
}

function fetchAllTables() {
    var parent = document.getElementsByTagName("tbody")[0]

	console.log("--------------")
	console.log(parent)

    var rows = document.getElementsByClassName("mtd-table-row")
    for (var i = 0; i<rows.length; i++) {
        content = rows[i].getElementsByClassName("mtd-table-cell")[1].innerHTML
        if (content.indexOf("骑行") == -1) {
            console.log("----")
            // rows[i].parentNode.removeChild(rows[i])
            // i -= 1
			rows[i].style.display = 'none'
        }
//         return
    }
}

function windowDidLoad() {
    console.log("windowDidLoad")

    
}

window.onload = windowDidLoad
