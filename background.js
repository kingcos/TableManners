let color = '#3aa757';

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ color });
  console.log('Default background color set to %cgreen', `color: ${color}`);
});

let tablesCount = 0

chrome.runtime.onInstalled.addListener(() => {
  tablesCount = document.getElementsByTagName("table").length
  console.log('表格数', `${tablesCount}`)

  chrome.storage.sync.set({ tablesCount })
});
