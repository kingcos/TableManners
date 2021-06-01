// // Initialize button with user's preferred color
// let changeColor = document.getElementById('changeColor');

// chrome.storage.sync.get('color', ({ color }) => {
//   changeColor.style.backgroundColor = color;
// });

// // When the button is clicked, inject setPageBackgroundColor into current page
// changeColor.addEventListener('click', async () => {
// 	let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

// 	chrome.scripting.executeScript({
// 		target: { tabId: tab.id },
// 		function: setPageBackgroundColor,
// 	});
// });
  
// // The body of this function will be executed as a content script inside the
// // current page
// function setPageBackgroundColor() {
// chrome.storage.sync.get('color', ({ color }) => {
// 		document.body.style.backgroundColor = color;
// 	});
// }

// let ActionEnum = {
//     FILTER: 'FILTER'
// }

// 过滤按钮
let getTablesButton = document.getElementById('getTablesButton')
document.getElementById('getTablesButton').addEventListener('click', async () => {
    console.log('getTablesButton')

    if (filterInputValue.length == 0) {
        // return
    }

    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.storage.local.get(['targetClass'], (result) => {
        console.log(result)
        var targetColumnClass = result.targetClass;

        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['script/content-script.js']
        }, () => {
            console.log(filterInputValue, targetColumnClass)
            chrome.tabs.sendMessage(tab.id, {content: filterInputValue, targetClass: targetColumnClass});
        })
    })
}, false)

// 文本框
let filterInput = document.getElementById('filter-input')
var filterInputValue = ''

filterInput.addEventListener('input', async (value) => {
    filterInputValue = value.target.value
})
