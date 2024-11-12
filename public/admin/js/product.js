//Delete
const buttonDelete = document.querySelectorAll("[button-delete]");
    if(buttonDelete.length > 0){
        const formDeleteItem = document.querySelector("#form-delete-item");
        const path = formDeleteItem.getAttribute("data-path");
        
        buttonDelete.forEach(button => {
            button.addEventListener("click", () => {
                const isConfirm = confirm("Bạn có chắc muốn xóa sản phẩm không?");

                if(isConfirm){
                    const id = button.getAttribute("data-id");

                    const action = `${path}/${id}?_method=DELETE`;

                    // console.log(action);

                    formDeleteItem.action = action;

                    formDeleteItem.submit();
                }
            });
        });
    }
//End Delete

//form delete multi
const formDeleteMulti = document.querySelector("[form-multi]");
if(formDeleteMulti){
    formDeleteMulti.addEventListener("submit", (e) => {
        e.preventDefault();
        
        const checkboxMulti = document.querySelector("[checkbox-multi]");
        const inputsChecked = checkboxMulti.querySelectorAll(
            "input[name='id']:checked"
        );

        const typeChange = e.target.elements.type.value;
        console.log(typeChange);

        if(typeChange == "delete-multi" && inputsChecked.length > 0){
            const isConfirm = confirm("Bạn có chắc chắn muốn xóa những sản phẩm này không?");

            if(!isConfirm){
                return;
            }
        }

        if(inputsChecked.length > 0){
            let ids = [];
            const inputIds = formDeleteMulti.querySelector("input[name='ids']");
            inputsChecked.forEach(input => {
                const id = input.value;
                ids.push(id);
            })
            console.log(ids.join(", "));
            inputIds.value = ids.join(", ");

            formDeleteMulti.submit();
        }else{
            alert("Vui lòng chọn ít nhất một bản ghi!");
        }
    });
}
///end form delete multi

//Form create new product
const autoSwitch = document.querySelectorAll(".form-group");
if (autoSwitch) {
    autoSwitch.forEach(group => {
        const textInput = group.querySelector("input[type='text']");
        const checkbox = group.querySelector("input[type='checkbox']");
        
        if (textInput && checkbox) {
            // Kiểm tra giá trị ban đầu từ server
            if (textInput.value === 'true') {
                checkbox.checked = true;
                textInput.value = 'có'; // Hiển thị "có" nếu value là "true"
            } else if (textInput.value === 'false') {
                checkbox.checked = false;
                textInput.value = 'không có'; // Hiển thị "không có" nếu value là "false"
            } else if (textInput.value === 'Đang cập nhật') {
                checkbox.checked = false; // Checkbox không bật nếu là "Đang cập nhật"
                // Không thay đổi giá trị của textInput
            } else if (textInput.value === 'Không có') {
                checkbox.checked = false; // Checkbox không bật nếu giá trị là "Không có"
            } else if (textInput.value.trim() !== '') {
                checkbox.checked = true; // Nếu có chuỗi khác thì checkbox bật và hiển thị nguyên văn
            }

            // Tự động bật checkbox khi có nội dung input và điều chỉnh văn bản
            textInput.addEventListener('input', () => {
                if (textInput.value.trim() !== '') {
                    checkbox.checked = true;
                }
            });

            // Xóa nội dung input nếu checkbox bị tắt thủ công
            checkbox.addEventListener('change', () => {
                if (!checkbox.checked) {
                    textInput.value = 'Không có'; // Hiển thị "Không có" nếu checkbox tắt
                } else if (textInput.value === 'Không có') {
                    textInput.value = 'Có'; // Đặt lại thành "Có" nếu bật checkbox
                }
            });
        }
    });
}

//End Form create new product

