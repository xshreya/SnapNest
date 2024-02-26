function loadContent() {
  s3.listObjects({ Prefix: "images" }, function (err, data) {
    if (err) {
      return alert("There was an error viewing your album: " + err.message);
    }
    var href = this.request.httpRequest.endpoint.href;
    var bucketUrl = href + "snapest-bucket" + "/";

    var photos = data.Contents.map(function (photo, id) {
      var photoKey = photo.Key;
      if (photoKey == "images/") return;

      var photoUrl = bucketUrl + photoKey;

      let imgContainer = document.getElementById("imageContainer");
      let imageName = photoKey.split("/");
      imageName = imageName[imageName.length - 1];

      let postcard = document.createElement("div");
      postcard.className = "col postcard";
      postcard.innerHTML = `
          <div class="card-container">
            <div class="card">
              <img src="${photoUrl}" id="${photoKey}" class="card-image" />
              <div class="overlay">
                <i class="fas fa-ellipsis-v triple-dot"></i>
                <div class="dropdown-menu" tabindex=${id}>
                  <button type="button" class="btn btn-sm btn-outline-secondary delete-btn" >Delete</button>
                  <button type="button" class="btn btn-sm btn-outline-secondary view-btn">View</button>
                  <button type="button" class="btn btn-sm btn-outline-secondary download-btn" >Download</button>
                </div>
              </div>
            </div>
          </div>`;

      let dwnloadBtn = postcard.querySelector(".download-btn");
      dwnloadBtn.addEventListener("click", () => {
        downloadImage(photoUrl, imageName);
        let dropdownMenu = postcard.querySelector(".dropdown-menu");
        // console.log(dropdownMenu);
        dropdownMenu.style.display = "none";
      });

      let viewImageBtn = postcard.querySelector(".view-btn");
      viewImageBtn.addEventListener("click", () => {
        var modal = document.getElementById("myModal");
        var modalImg = document.getElementById("img01");
        modal.style.display = "block";
        modal.style.zIndex = 5;
        modalImg.src = photoUrl;
        let dropdownMenu = postcard.querySelector(".dropdown-menu");
        // console.log(dropdownMenu);
        dropdownMenu.style.display = "none";
      });

      let deleteImageBtn = postcard.querySelector(".delete-btn");
      deleteImageBtn.addEventListener("click", () => {
        deletePhoto(photoKey);
        let dropdownMenu = postcard.querySelector(".dropdown-menu");
        // console.log(dropdownMenu);
        dropdownMenu.style.display = "none";
      });

      let optionsMenu = postcard.querySelector(".triple-dot");
      // console.log(optionsMenu);
      optionsMenu.addEventListener("click", () => {
        let dropdownMenu = postcard.querySelector(".dropdown-menu");
        // console.log(dropdownMenu);
        dropdownMenu.style.display = "block";
        // dropdownMenu.style.zindex=1000000000;
        dropdownMenu.style.position = "absolute";
        // dropdownMenu.style.top="2rem";
        // console.log("focused")
        dropdownMenu.focus();
      });
      let dropdownMenu = postcard.querySelector(".dropdown-menu");
      console.log(dropdownMenu);
      dropdownMenu.style.display = "none";
      dropdownMenu.addEventListener("mouseleave", () => {
        // console.log("focus lost");
        dropdownMenu.style.display = "none";
      });
      imgContainer.append(postcard);

      // // Add event listener to this card
      // postcard.addEventListener('click', function (event) {
      //   // Check if the clicked element is the triple dot button
      //   if (event.target.classList.contains('triple-dot')) {
      //     // Close all other open dropdown menus
      //     const allDropdowns = document.querySelectorAll('.dropdown-menu.show');
      //     allDropdowns.forEach(menu => {
      //       if (menu !== this.querySelector('.dropdown-menu')) {
      //         menu.classList.remove('show');
      //       }
      //     });

      //     // Get reference to the dropdown menu within this postcard
      //     const dropdownMenu = this.querySelector('.dropdown-menu');
      //     // Toggle the class to show/hide the dropdown menu
      //     dropdownMenu.display.style="none"

      //     // Get position of the triple dot button
      //     const tripleDotButton = event.target;
      //     const rect = tripleDotButton.getBoundingClientRect();

      //     // Position the dropdown menu relative to the triple dot button
      //     dropdownMenu.style.position = 'absolute'; // or 'fixed' depending on your layout
      //     dropdownMenu.style.top = `${rect.bottom}px`;
      //     dropdownMenu.style.left = `${rect.left}px`;

      //     // Append dropdown menu to the postcard
      //     this.appendChild(dropdownMenu);
      //   } else {
      //     // If clicked outside the triple dot button, close all dropdown menus
      //     const allDropdowns = document.querySelectorAll('.dropdown-menu');
      //     allDropdowns.forEach(menu => {
      //       if (menu !== this.querySelector('.dropdown-menu')) {
      //         menu.classList.remove('show');
      //       }
      //     });
      //   }
      // });
    });
  });
}

// Call the function to fetch data and create cards
loadContent();

// Add scroll functionality in relation to the image
document.addEventListener("scroll", function () {
  const allDropdowns = document.querySelectorAll(".dropdown-menu.show");
  allDropdowns.forEach((menu) => {
    const rect = menu.parentElement.getBoundingClientRect();
    const image = menu.closest(".card").querySelector(".card-image");
    const imageRect = image.getBoundingClientRect();
    const topPosition = imageRect.bottom - rect.height;
    const leftPosition = imageRect.left;
    menu.style.position = "absolute";
    menu.style.top = `${topPosition}px`;
    menu.style.left = `${leftPosition}px`;
  });
});

function deletePhoto(photoKey) {
  s3.deleteObject({ Key: photoKey }, function (err, data) {
    if (err) {
      return alert("There was an error deleting your photo: " + err.message);
    }
    alert("Successfully deleted photo.");
    location.reload();
  });
}

async function downloadImage(imageSrc, nameOfDownload) {
  const response = await fetch(imageSrc, {
    method: "GET",
    headers: { "Cache-Control": "no-cache" },
  });

  const blobImage = await response.blob();

  const href = URL.createObjectURL(blobImage);

  const anchorElement = document.createElement("a");
  anchorElement.href = href;
  anchorElement.download = nameOfDownload;

  document.body.appendChild(anchorElement);
  anchorElement.click();

  document.body.removeChild(anchorElement);
  window.URL.revokeObjectURL(href);
}

// close span
let closeImg = document.getElementsByClassName("close");
// console.log(closeImg);
closeImg[0].addEventListener("click", () => {
  var modal = document.getElementById("myModal");
  var modalImg = document.getElementById("img01");
  modal.style.display = "none";
  modalImg.src = "";
});
