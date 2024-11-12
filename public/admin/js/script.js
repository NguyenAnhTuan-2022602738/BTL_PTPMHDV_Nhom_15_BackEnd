//Form search
const formSearch = document.querySelector("#form-search");
if (formSearch) {
  let url = new URL(window.location.href);

  formSearch.addEventListener("submit", (e) => {
    e.preventDefault();
    const keyword = e.target.elements.keyword.value;

    if (keyword) {
      url.searchParams.set("keyword", keyword);
    } else {
      url.searchParams.delete("keyword");
    }

    window.location.href = url.href;
  });
}
//End Form search

//pagination
const buttonsPagination = document.querySelectorAll("[button-pagination]");
if (buttonsPagination) {
  let url = new URL(window.location.href);

  buttonsPagination.forEach((button) => {
    button.addEventListener("click", () => {
      const page = button.getAttribute("button-pagination");

      url.searchParams.set("page", page);

      window.location.href = url.href;
    });
  });
}
//End pagination

//checkbox multi
const checkboxMulti = document.querySelector("[checkbox-multi]");
if (checkboxMulti) {
  const inputCheckAll = checkboxMulti.querySelector("input[name='checkall']");
  const inputsId = checkboxMulti.querySelectorAll("input[name='id']");

  inputCheckAll.addEventListener("click", () => {
    if (inputCheckAll.checked) {
      inputsId.forEach((input) => {
        input.checked = true;
      });
    } else {
      inputsId.forEach((input) => {
        input.checked = false;
      });
    }
  });

  inputsId.forEach((input) => {
    input.addEventListener("click", () => {
      const countChecked = checkboxMulti.querySelectorAll(
        "input[name='id']:checked"
      ).length;
      if (countChecked == inputsId.length) {
        inputCheckAll.checked = true;
      } else {
        inputCheckAll.checked = false;
      }
    });
  });
}
//End checkbox multi

//show-alert
const showAlert = document.querySelector("[show-alert]");
if (showAlert) {
  const time = parseInt(showAlert.getAttribute("data-time"));
  const closeAlert = showAlert.querySelector("[close-alert]");
  // Add the alert-hidden class after the specified time
  setTimeout(() => {
    showAlert.classList.add("alert-hidden");
  }, time);

  closeAlert.addEventListener("click", () => {
    showAlert.classList.add("alert-hidden");
  });
}
//End show-alert
const uploadImage = document.querySelector("[upload-image]");
if (uploadImage) {
  const uploadImageInput = document.querySelector("[upload-image-input]");
  const uploadImagesPreview = document.querySelector("[upload-images-preview]");
  const filesArray = []; // Mảng để lưu tất cả các file ảnh mới
  const deletedImages = []; // Mảng lưu các ảnh bị xóa

  // Hàm để tạo ảnh preview
  function createImagePreview(file, existing = false) {
    const imagePreviewContainer = document.createElement("div");
    imagePreviewContainer.classList.add("box-image-preview");

    const img = document.createElement("img");
    img.src = existing ? file : URL.createObjectURL(file);
    img.classList.add("image-preview");

    const closeButton = document.createElement("span");
    closeButton.textContent = "x";
    closeButton.classList.add("close-upload-image");

    closeButton.addEventListener("click", () => {
      imagePreviewContainer.remove();
      if (existing) {
        // Nếu là ảnh cũ, lưu vào mảng deletedImages để gửi lên server
        deletedImages.push(file);
      } else {
        const index = filesArray.indexOf(file);
        if (index > -1) filesArray.splice(index, 1);

        const updatedFileList = new DataTransfer();
        filesArray.forEach((f) => updatedFileList.items.add(f));
        uploadImageInput.files = updatedFileList.files;
      }
    });

    imagePreviewContainer.appendChild(img);
    imagePreviewContainer.appendChild(closeButton);
    uploadImagesPreview.appendChild(imagePreviewContainer);
  }

  // Hiển thị ảnh từ `car.imageUrl` trong form edit nếu có
  const existingImages = JSON.parse(
    uploadImagesPreview.getAttribute("data-existing-images") || "[]"
  );
  existingImages.forEach((imageUrl) => {
    createImagePreview(imageUrl, true);
    filesArray.push(imageUrl); // Thêm vào filesArray để không bị mất khi lưu
  });

  // Lắng nghe sự kiện thay đổi file đầu vào
  uploadImageInput.addEventListener("change", (e) => {
    const newFiles = Array.from(e.target.files);

    // Duyệt qua các file mới được chọn
    newFiles.forEach((file) => {
      if (
        !filesArray.some((f) => f.name === file.name && f.size === file.size)
      ) {
        filesArray.push(file);
        createImagePreview(file);
      }
    });

    const updatedFileList = new DataTransfer();
    filesArray.forEach((f) => updatedFileList.items.add(f));
    uploadImageInput.files = updatedFileList.files;
  });

  // Hàm để thu thập tất cả các đường dẫn hình ảnh từ box-image-preview
  const collectImageUrls = () => {
    const existingImageElements = document.querySelectorAll(
      ".box-image-preview img"
    );
    const imageUrls = [];

    existingImageElements.forEach((img) => {
      imageUrls.push(img.src); // Lấy src của từng hình ảnh
    });

    return imageUrls;
  };

  // Khi bạn lưu, hãy đảm bảo rằng filesArray chứa tất cả các file
  const saveFiles = () => {
    const finalFilesArray = [...filesArray, ...collectImageUrls()]; // Kết hợp file mới và file cũ
    // Thực hiện lưu trữ ở đây với finalFilesArray
    // Ví dụ: gửi finalFilesArray và deletedImages đến server qua fetch hoặc AJAX
    const formData = new FormData();
    finalFilesArray.forEach((file) => formData.append("images[]", file));
    deletedImages.forEach((image) => formData.append("deletedImages[]", image)); // Gửi ảnh bị xóa
    // Gửi formData đến server qua AJAX hoặc fetch
  };

  // Gọi saveFiles() khi cần thiết, ví dụ khi nhấn nút lưu
  const saveButton = document.querySelector("#save-button"); // Đảm bảo bạn có nút lưu
  if (saveButton) {
    saveButton.addEventListener("click", saveFiles);
  }
}

// Lấy tất cả các ảnh thu nhỏ trong thư viện ảnh
const galleryThumbs = document.querySelectorAll(".gallery-car .thumb-img");

if (galleryThumbs.length > 0) {
  console.log(galleryThumbs);
  galleryThumbs.forEach((thumb) => {
    thumb.addEventListener("click", (event) => {
      const imageIndex = event.currentTarget.getAttribute("data-id");
      const mainImage = document.querySelector(".thumb-big .main-image");

      // Thay đổi ảnh chính khi click vào ảnh thu nhỏ
      const newImageSrc = car.imageUrl[imageIndex];
      mainImage.src = newImageSrc;

      // Tạo modal để hiển thị ảnh phóng to
      const modal = document.createElement("div");
      modal.classList.add("image-modal");
      modal.innerHTML = `
                <div class="modal-content">
                    <span class="close-modal">×</span>
                    <img src="${newImageSrc}" alt="Image">
                </div>
            `;
      document.body.appendChild(modal);

      // Hiển thị modal
      modal.style.display = "flex"; // Hiển thị modal
      modal.classList.add("show"); // Thêm class để tạo hiệu ứng zoom vào ảnh

      // Thêm sự kiện đóng modal
      modal.querySelector(".close-modal").addEventListener("click", () => {
        modal.remove();
      });

      // Tạo hiệu ứng mờ xung quanh khi mở modal
      document.body.style.overflow = "hidden"; // Ngừng cuộn trang khi modal hiển thị
    });
  });
}

// end xử lý hiện ảnh

// Xử lý sự kiện click cho nút import file
const importButton = document.querySelector("#importFileBtn"); // ID của nút import
if (importButton) {
  importButton.addEventListener("click", () => {
    const modal = document.querySelector("#importModal");
    if (modal) {
      modal.style.display = "block"; // Hiển thị modal
    }
  });

  // Đóng modal khi nhấn nút 'x'
  const closeModal = document.querySelector(".close-modal");
  if (closeModal) {
    closeModal.addEventListener("click", () => {
      const modal = document.querySelector("#importModal");
      if (modal) {
        modal.style.display = "none"; // Ẩn modal
      }
    });
  }
}
//End Xử lý sự kiện click cho nút import file
// Đóng modal khi nhấn ra ngoài modal
window.addEventListener("click", (event) => {
  const modal = document.querySelector("#importModal");
  if (event.target === modal) {
    modal.style.display = "none";
  }
});

// Xử lý sự kiện hiển thị bảng thông số kỹ thuật
const tableHidden = document.querySelectorAll(".specs-header");
if (tableHidden) {
  tableHidden.forEach((header) => {
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

//sort product
const sort = document.querySelector("[sort]");
if (sort) {
  let url = new URL(window.location.href);

  const sortSelect = sort.querySelector("[sort-select]");
  const sortClear = sort.querySelector("[sort-clear]");

  //select
  sortSelect.addEventListener("change", (e) => {
    const value = e.target.value;
    const [sortKey, sortValue] = value.split("-");

    url.searchParams.set("sortKey", sortKey);
    url.searchParams.set("sortValue", sortValue);

    window.location.href = url.href;

    sortSelect.value = value;
  });

  //clear
  sortClear.addEventListener("click", () => {
    url.searchParams.delete("sortKey");
    url.searchParams.delete("sortValue");

    window.location.href = url.href;
  });

  //Thêm selected cho option
  const sortKey = url.searchParams.get("sortKey");
  const sortValue = url.searchParams.get("sortValue");

  if(sortKey && sortValue){
    const stringSort = `${sortKey}-${sortValue}`;
    const optionSelected = sortSelect.querySelector(`option[value = '${stringSort}']`);
    optionSelected.selected = true;
  }
}
//Endsort product
