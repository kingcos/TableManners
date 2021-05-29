// 选中的节点
var selectedNode = document.getSelection().anchorNode

// 目标列以选定（返回 class）
var targetColumnClass = findTargetColumn(selectedNode)

if (targetColumnClass) {
    alert('已锁定列')

    chrome.storage.local.set({ targetClass: targetColumnClass }, function() {
        console.log('Value is set to ' + targetColumnClass);
    });
} else {
    alert('请重试')
}

function findTargetColumn(selectedNode) {
    var targetClassName = 'table_manners_target'

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
                    if (tbody.children[i].nodeName.toLowerCase() != 'tr'
                     || tbody.children[i].childElementCount <= thIndex) {
                        return
                    }

                    var targetTD = tbody.children[i].children[thIndex]
                    if (targetTD.classList.contains(targetClassName)) {
                        // 已经含有；TODO
                    } else {
                        targetTD.classList.add(targetClassName)
                    }
                }

                return targetClassName
            } else {
                // 不存在 thead；TODO
                alert('不存在 thead')
            }
        }
    } else {
        // 有 td（表体），找 td 序号
        var tdIndex = getChildElementIndex(closestTD)

        return addClass(closestTD.parentNode, tdIndex, targetClassName)
    }
}

function addClass(trNode, index, targetClassName) {
    if (trNode == null 
     || trNode.parentNode == null
     || trNode.parentNode.childElementCount <= 0
     || trNode.nodeName.toLowerCase() != 'tr') {
        alert('')
        return
    }

    for (var i = 0; i < trNode.parentNode.children.length; i += 1) {
        var tr = trNode.parentNode.children[i]
        var targetTD = tr.children[index]
        if (targetTD.classList.contains(targetClassName)) {
            // 已经含有；TODO
        } else {
            targetTD.classList.add(targetClassName)
        }
    }

    return targetClassName
}

function getChildElementIndex(node) {
    return Array.prototype.indexOf.call(node.parentNode.children, node)
}

function fetchAllText(node) {
    var content = ''

    return content
}