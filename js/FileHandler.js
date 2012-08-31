var FileHandler = function()
{
    var handler = this;
    handler.fileSelect = document.getElementById('fileSelect');
    handler.fileInput = document.getElementById('fileInput');
    handler.thumbsList = document.getElementById('thumbsList');

    handler.fileSelect.addEventListener('click', function(e) {
        if (handler.fileInput) {
            handler.fileInput.click();
        }
        e.preventDefault();
    }, false);

    handler.fileInput.addEventListener('change', function() {
        handler.handleFiles(handler, this);
    }, false);
};

FileHandler.prototype.handleFiles = function(context, input) {
    var handler = context;

    var files = input.files,
        imageType = /image.*/,
        file;

    if (!files.length) {
        return;; // No files selected
    }

    file = files[0]; // handle the first file only

    if (!file.type.match(imageType)) {
        return; // Not an image file
    }

    // add the image in the list of thumbs
    var li = document.createElement('li'),
        img = document.createElement('img');

    handler.thumbsList.appendChild(li);
    li.appendChild(img);

    img.width = "120";
    img.draggable = true;
    img.style.cursor = 'pointer';

    img.ondragstart = function(event) {
        event.dataTransfer.setData('text/plain', img.src);
    };

    try {
        var URL = window.url || window.webkitURL;
        var imgURL = URL.createObjectURL(file);
        img.src = imgURL;
        URL.revokeObjectURL(imgURL);
    } catch (e) {
        try {
            var fileReader = new FileReader();
            fileReader.onload = function(event) {
                img.src = event.target.result;
            };
            fileReader.readAsDataURL(file);
        } catch (e) {
            var error = document.getElementById('error');
            if (error) error.innerHTML = "Can not create the thumb";
        }
    }
}

