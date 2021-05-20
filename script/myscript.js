function delUnrelatedRows() {
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

window.onload = delUnrelatedRows;
