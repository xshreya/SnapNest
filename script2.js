async function loadContent() {
    s3.listObjects({ Prefix: "images" }, function (err, data) {
      if (err) {
        return alert("There was an error viewing your album: " + err.message);
      }
      // 'this' references the AWS.Response instance that represents the response
      var href = this.request.httpRequest.endpoint.href;
      console.log("href is",href)
      var bucketUrl = href + "snapest-bucket" + "/";
      console.log("bucketurl is",bucketUrl)
  
      // return
      var photos = data.Contents.map(function (photo) {
        console.log("photo is", photo);
        var photoKey = photo.Key;
        var photoUrl = bucketUrl + photoKey;
        console.log("photokey is", photoUrl);
  
        let imgContainer = document.getElementById("imageContainer");
        let imageName = photoKey.split("/");
        imageName[imageName.length - 1];
        // console.log(imgContainer)
        let postcard = document.createElement("div");
        postcard.className = "col postcard";
        // console.log(postcard)
        postcard.innerHTML = `<div class="card shadow-sm">
      <img src="${photoUrl}" id=${photoKey} class="card-image" />
      
      <div class="card-body">
        <p class="card-text">${imageName[imageName.length - 1]}</p>
        <div class="d-flex justify-content-between align-items-left">
          <div class="btn-group">
            <button type="button" class="btn btn-sm btn-outline-secondary delete-btn" >Delete</button>
            <button type="button" class="btn btn-sm btn-outline-secondary view-btn">View</button>
            <button type="button" class="btn btn-sm btn-outline-secondary download-btn" >Download</button>
          </div>
        </div>
      </div>
    </div>`;
  
        let dwnloadBtn=postcard.getElementsByClassName("download-btn")
        console.log(dwnloadBtn[0])
        imgContainer.append(postcard);
      });
    });
    return 1;
  }
  loadContent();
  
  window.addEventListener("load", async (event) => {
    console.log("window loaded");
    // if(await loadContent()==1)
    // {
    //   let deletebtn=document.querySelectorAll("delete-btn")
    //   console.log(deletebtn)
    // }
  });
  
  // setTimeout(()=>{
  //   location.reload()
  // },4000)
  
  function deletePhoto(photoname) {
    s3.deleteObject({ Key: "images/" + photoname }, function (err, data) {
      if (err) {
        return alert("There was an error deleting your photo: ", err.message);
      }
      alert("Successfully deleted photo.");
      // viewAlbum(albumName);
    });
  }
  deletePhoto("penguin.png");
  function downloadPic(url)
  {
    location.replace(url)
  }