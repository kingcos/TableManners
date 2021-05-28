// 选中的节点
var selectedNode = document.getSelection().anchorNode

// 先找最近的 Table
var closestTable = selectedNode.parentNode.closest('table')
if (closestTable == null) {
    // 找不到节点树上的 Table，说明没表格，返回

    return
}

// 再找最近的 td
var closestTD = selectedNode.parentNode.closest('td')
if (closestTD == null) {
    // td 找不到，说明没在表格内部，尝试下 th（表头）
    var closestTH = selectedNode.parentNode.closest('th')
    if (closestTH == null) {
        // 表格有问题 🤨 / 未适配
        alert('表格有问题 🤨 / 未适配')
    } else {
        // 找到表头单元格

        // 找所在的序号
        var thIndex = getChildElementIndex(closestTH)

        // 找 tr
        var tr = closestTH.parentNode
        if (tr.parentNode.nodeName.toLowerCase() == 'thead') {
            // 存在 thead
            var thead = tr.parentNode

            var allThead = document.getElementsByTagName('thead')
            var theadIndex = Array.prototype.indexOf.call(allThead, thead)
            var allTbody = document.getElementsByTagName('tbody')
            var tbody = allTbody[theadIndex]

            for (var i = 0; i < tbody.children.length; i += 1) {
                if (tbody.children[i].nodeName.toLowerCase != 'tr') {
                    return
                }


            }


        } else {
            // 不存在 thead；TODO
            
        }
    }
} else {
    // 直接找 tbody

}

function getChildElementIndex(node) {
    return Array.prototype.indexOf.call(node.parentNode.children, node);
}

function fetchAllText(node) {
    var content = ''

    return content
}