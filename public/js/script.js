// Xử lý sự kiện hiển thị bảng thông số kỹ thuật
const tableHidden = document.querySelectorAll(".specs-header");
if(tableHidden) {
    tableHidden.forEach(header => {
        header.addEventListener("click", () => {
            const table = header.nextElementSibling; // Get the table after the header
            const toggleSign = header.querySelector(".toggle-sign i");

            // Toggle the visibility of the table and the header's "open" class
            table.classList.toggle("show");
            header.classList.toggle("open");

            // Toggle icon class between plus and minus
            if (table.classList.contains("show")) {
                toggleSign.classList.remove("fa-plus");
                toggleSign.classList.add("fa-minus");
            } else {
                toggleSign.classList.remove("fa-minus");
                toggleSign.classList.add("fa-plus");
            }
        });
    });
}
// End Xử lý sự kiện hiển thị bảng thông số kỹ thuật