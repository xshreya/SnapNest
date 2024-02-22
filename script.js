function dragOverHandler(event) {
    event.preventDefault();
}

function dropHandler(event) {
    event.preventDefault();
    const files = event.dataTransfer.files;
    handleFiles(files);
}
// Run this code when the page is loaded
window.onload = function() {
    // Show the box
    document.getElementById('box').style.display = 'block';
};


var filetoupload = null;

function handleFiles(files) {
    const file = files[0];
    filetoupload = file;
    if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const img = new Image();
            img.src = event.target.result;
            img.style.maxHeight = '50%';
            
            // Remove previously uploaded image if exists
            const previousImage = document.querySelector('#popup-container img');
            if (previousImage) {
                previousImage.remove();
            }
            
            document.getElementById('popup-container').appendChild(img);
        };
        reader.readAsDataURL(file);
    } else {
        alert('Please drop an image file.');
    }
}


function showPopup(event) {
    event.preventDefault(); 
    document.getElementById('popupOverlay').style.display = 'block';
}

function hidePopup() {
    document.getElementById('popupOverlay').style.display = 'none';
}

// Add event listener to the upload button in the popup to handle file selection
document.getElementById('fileInputPopup').addEventListener('change', function() {
    handleFiles(this.files);
});


var bucketName = "lamda-s3-for-assignment";
var bucketRegion = "ap-south-1";
var IdentityPoolId = "ap-south-1:a0ddc8e7-a3e4-4f2e-9f1a-07805faea0f9";

AWS.config.update({
    region: bucketRegion,
    credentials: new AWS.CognitoIdentityCredentials({
        IdentityPoolId: IdentityPoolId
    })
});

var s3 = new AWS.S3({
    apiVersion: '2006-03-01',
    params: { Bucket: bucketName }
});

function s3upload() {
    // var files = document.getElementById('fileUpload').files;
    console.log(typeof(filetoupload));
    if (filetoupload==null) {
        return alert("Please choose a file to upload first.");
    }
    // var file = files[0];
    // console.log(file)
    // return
    var fileName = filetoupload.name;
    var fileKey = "images" + "/" + fileName;



    // Use S3 ManagedUpload class as it supports multipart uploads
    var upload = new AWS.S3.ManagedUpload({
        params: {
            Bucket: bucketName,
            Key: fileKey,
            Body: filetoupload,
        },
    });

    var promise = upload.promise();

    promise.then(
        function (data) {
            alert("Successfully uploaded photo.");

        },
        function (err) {
            return alert("There was an error uploading your photo: ", err.message);
        }
    );
};
