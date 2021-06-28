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

// // 过滤按钮
// let getTablesButton = document.getElementById('getTablesButton')
// document.getElementById('getTablesButton').addEventListener('click', async () => {
//     console.log('getTablesButton')

//     if (filterInputValue.length == 0) {
//         // return
//     }

//     let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

//     chrome.storage.local.get(['targetClass'], (result) => {
//         console.log(result)
//         var targetColumnClass = result.targetClass;

//         chrome.scripting.executeScript({
//             target: { tabId: tab.id },
//             files: ['script/content-script.js']
//         }, () => {
//             console.log(filterInputValue, targetColumnClass)
//             chrome.tabs.sendMessage(tab.id, {content: filterInputValue, targetClass: targetColumnClass});
//         })
//     })
// }, false)

// // 文本框
// let filterInput = document.getElementById('filter-input')
// var filterInputValue = ''

// filterInput.addEventListener('input', async (value) => {
//     filterInputValue = value.target.value
// })

document.addEventListener('DOMContentLoaded', () => {
    let onoff = document.querySelector('#tm-onoff')
    let keywordOnoff = document.querySelector('#tm-onoff-keyword')

    let onOffChecked = true
    let keywordOnoffChecked = false

    // let test = document.querySelector('#tm-onoff-test')

    chrome.storage.local.get(['tm-onoff', 'tm-onoff-keyword'], function(result) {
        console.log(result['tm-onoff'], result['tm-onoff-keyword'])

        onOffChecked = result['tm-onoff'] == undefined ? true : result['tm-onoff']
        keywordOnoffChecked = result['tm-onoff-keyword'] == undefined ? false : result['tm-onoff-keyword']

        if (onoff != null) {
            // let label = onoff.parentNode
            if (onOffChecked) {
                // label.innerHTML = label.innerHTML.replace('停', '启')
                onoff.setAttribute('checked', 'checked')
            } else {
                // label.innerHTML = label.innerHTML.replace('启', '停')
                onoff.removeAttribute('checked')
            }
        }

        if (keywordOnoff != null) { 
            if (keywordOnoffChecked) {
                keywordOnoff.setAttribute('checked', 'checked')
            } else {
                keywordOnoff.removeAttribute('checked')
            }
        }
    })

    if (onoff) {
        onoff.addEventListener('change', (event) => {
            onOffChecked = !onOffChecked
    
            // let label = event.target.parentNode
            // if (onOffChecked) {
            //     label.innerHTML = label.innerHTML.replace('启', '停')
            // } else {
            //     label.innerHTML = label.innerHTML.replace('停', '启')
            // }
    
            chrome.storage.local.set({'tm-onoff': onOffChecked})
        })
    }

    if (keywordOnoff) {
        keywordOnoff.addEventListener('change', (event) => {
            keywordOnoffChecked = !keywordOnoffChecked
            chrome.storage.local.set({'tm-onoff-keyword': keywordOnoffChecked});
        })
    }

    // test.addEventListener('change', (event) => {
    //     chrome.storage.local.get(['tm-onoff', 'tm-onoff-keyword'], function(result) {
    //         console.log(result['tm-onoff'], result['tm-onoff-keyword'])
    //         if (result['tm-onoff']) {
    //             onoff.setAttribute('checked', 'checked')
    //         } else {
    //             onoff.removeAttribute('checked')
    //         }

    //         if (result['tm-onoff-keyword']) {
    //             keywordOnoff.setAttribute('checked', 'checked')
    //         } else {
    //             keywordOnoff.removeAttribute('checked')
    //         }
    //     });
    // })
})
