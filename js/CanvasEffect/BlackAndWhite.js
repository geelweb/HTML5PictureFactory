if (typeof CanvasEffect == 'undefined') {
    var CanvasEffect = {};
}

CanvasEffect.BlackAndWhite = function()
{
};

CanvasEffect.BlackAndWhite.prototype.apply = function(canvas)
{
    var ctx = canvas.getContext('2d');
    var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    for (var i = 0, n = imageData.data.length; i < n; i += 4) {
        var grayscale = imageData.data[i] * .3 + imageData.data[i+1] * .59 + imageData.data[i+2] * .11;
        imageData.data[i ] = grayscale;   // red
        imageData.data[i+1] = grayscale;   // green
        imageData.data[i+2] = grayscale;   // blue
    }
    ctx.putImageData(imageData, 0, 0);

}

