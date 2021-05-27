console.log('--- background.js ---')
  
chrome.contextMenus.create({
    id: 'select_this_column',
    title: '尝试按该列筛选',
    contexts: ['selection']
}, () => {
    console.log('Context menu added successfully!')
})

chrome.contextMenus.onClicked.addListener((info, tab) => {
    console.log(info)
    console.log(tab)
})
