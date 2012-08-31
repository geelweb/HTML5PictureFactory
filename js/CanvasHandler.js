var CanvasHandler = function()
{

    this.canvas = document.getElementById('previewCanvas');
    this.btnDownload = document.getElementById('btnDownload');

    this.ctx = this.canvas.getContext('2d');

    this.ix = 0;

    this.selectedImg = null;
    this.selectedHandle = null;

    this.imgs = [];

    this.effect = null;

    // canvas dimensions
    this.cw = this.canvas.width;
    this.ch = this.canvas.height;

    // canvas scale based on dim
    this.sx = this.cw / this.canvas.offsetWidth;
    this.sy = this.ch / this.canvas.offsetHeight;

    this.cx = 0;
    this.cy = 0;

    var handler = this;

    this.btnDownload.addEventListener('click', function(evt) {
        handler.savePicture(handler, evt);
    }, false);

    this.canvas.addEventListener('dragover', function(event) {
        event.preventDefault();
    }, false);

    this.canvas.addEventListener('drop', function(evt) {
        handler.dropImageToCanvas(handler, evt);
    }, false);

    this.canvas.addEventListener('mouseup', function(evt) {
        handler.onMouseUp(handler, evt);
    }, false);

    this.canvas.addEventListener('mousedown', function(evt) {
        handler.onMouseDown(handler, evt);
    }, false);

    this.canvas.addEventListener('mousemove', function(evt) {
        handler.onMouseMove(handler, evt);
    }, false);

    setInterval(function() {
        handler.repaint(handler);
    }, 100);
};

CanvasHandler.prototype.dropImageToCanvas = function(context, event)
{
    var src = event.dataTransfer.getData('text/plain');
    var img = new Image()
    img.onload = function() {
        context.ix += 1

        img.id = 'img_' + context.ix;

        var px = (event.pageX - context.canvas.offsetLeft) * context.sx,
            py = (event.pageY - context.canvas.offsetTop) * context.sy,
            pw = 120,
            ph = img.height * (pw / img.width);

        context.imgs[context.ix] = {'img': img, 'ix': context.ix, 'px':px, 'py': py, 'pw': pw, 'ph': ph};

        // litle tricky but force the canvas to be repainted immediatly on some
        // browsers...
        context.canvas.style.display = 'none';
        context.canvas.style.display = 'block';
        context.canvas.focus();
    };
    img.dragable = true;
    img.src = src;

    event.preventDefault();
};

CanvasHandler.prototype.IsCursorOverAnImage = function(x, y)
{
    var handler = this;

    var img = null;
    this.imgs.forEach(function(item) {
        if (
            (x - handler.canvas.offsetLeft) * handler.sx > item['px']
            &&  (x - handler.canvas.offsetLeft) * handler.sx < item['px'] + item['pw']
            && (y - handler.canvas.offsetTop) * handler.sy > item['py']
            &&  (y - handler.canvas.offsetTop) * handler.sy < item['py'] + item['ph']
        ) img=item['ix'];
    });
    return img;
};

CanvasHandler.prototype.IsCursorOverAnImageHandle = function(x, y)
{
    var handler = this;

    var handle = null;
    var mx = (x - this.canvas.offsetLeft) * this.sx;
    var my = (y - this.canvas.offsetTop) * this.sy;
    this.imgs.forEach(function(item) {
        var handles = handler.getHandles(item);
        handles.forEach(function(h) {
            if (
            //(mx-h['x'])*(mx-h['x'])+(my-h['y'])*(my-h['y']) < h['r']*h['r']
                mx > h['x'] && mx < h['x']+h['r'] && my > h['y'] && my < h['y'] + h['r']
            ) {
                handle = h['id'];
            }
        });
    });
    return handle;
};

CanvasHandler.prototype.onMouseUp = function(context, event)
{
    context.selectedImg = null;
    context.selectedHandle = null;
};

CanvasHandler.prototype.onMouseDown = function(context, event)
{
    context.selectedImg = context.IsCursorOverAnImage(event.pageX, event.pageY);
    context.selectedHandle = context.IsCursorOverAnImageHandle(event.pageX, event.pageY);
    if (context.selectedImg != null) {
        if (context.selectedHandle !== null) {
            // resize
            var handles = context.getHandles(context.imgs[context.selectedImg]);
            var handle = handles[context.selectedHandle];
            context.cx = handle['x'];
            context.cy = handle['y'];
        } else {
            // move
            context.cx = (event.pageX - context.canvas.offsetLeft) * context.sx - context.imgs[context.selectedImg]['px'];
            context.cy = (event.pageY - context.canvas.offsetTop) * context.sy - context.imgs[context.selectedImg]['py'];
        }
    }
};

CanvasHandler.prototype.onMouseMove = function(context, event)
{
    if ( null !== context.IsCursorOverAnImage(event.pageX, event.pageY) ) {
        document.body.style.cursor = 'pointer';
    } else {
        document.body.style.cursor = 'default';
    }

    if (context.selectedHandle != null) {
        var handles = context.getHandles(context.imgs[context.selectedImg]);
        var x = (event.pageX - context.canvas.offsetLeft),
            y = (event.pageY - context.canvas.offsetTop);
        if (context.selectedHandle == 1) {
            context.imgs[context.selectedImg]['pw'] = context.imgs[context.selectedImg]['pw'] + (context.imgs[context.selectedImg]['px'] - x);
            context.imgs[context.selectedImg]['ph'] = context.imgs[context.selectedImg]['ph'] + (context.imgs[context.selectedImg]['py'] - y)
            context.imgs[context.selectedImg]['px'] = x;
            context.imgs[context.selectedImg]['py'] = y;
        }
        if (context.selectedHandle == 2) {
            context.imgs[context.selectedImg]['pw'] = x - context.imgs[context.selectedImg]['px'];
            context.imgs[context.selectedImg]['ph'] = context.imgs[context.selectedImg]['ph'] + (context.imgs[context.selectedImg]['py'] - y)
            context.imgs[context.selectedImg]['py'] = y;
        }
        if (context.selectedHandle == 3) { // ok
            context.imgs[context.selectedImg]['pw'] = x - context.imgs[context.selectedImg]['px'];
            context.imgs[context.selectedImg]['ph'] = y - context.imgs[context.selectedImg]['py'];
        }
        if (context.selectedHandle == 4) { // ok
            context.imgs[context.selectedImg]['pw'] = context.imgs[context.selectedImg]['pw'] + (context.imgs[context.selectedImg]['px'] - x);
            context.imgs[context.selectedImg]['ph'] = y - context.imgs[context.selectedImg]['py'];
            context.imgs[context.selectedImg]['px'] = x;

        }

    } else if (context.selectedImg != null) {
        context.imgs[context.selectedImg]['px'] = (event.pageX - context.canvas.offsetLeft)*context.sx - context.cx*context.sx;
        context.imgs[context.selectedImg]['py'] = (event.pageY - context.canvas.offsetTop)*context.sy - context.cy*context.sy;
    }
};

CanvasHandler.prototype.repaint = function(context)
{
    context.ctx.clearRect(0, 0, context.cw, context.ch);

    context.imgs.forEach(function(item) { context.drawImage(item); });

    if (context.effect != null) context.effect.apply(context.canvas);
};

CanvasHandler.prototype.getHandles = function(img)
{
    var handles = [];
    var w=10;
    handles[1] = {'id': 1, 'x': img['px'], 'y': img['py'], 'r': w};
    handles[2] = {'id': 2, 'x': img['px']+img['pw']-w, 'y': img['py'], 'r': w};
    handles[3] = {'id': 3, 'x': img['px']+img['pw']-w, 'y': img['py']+img['ph']-w, 'r': w};
    handles[4] = {'id': 4, 'x': img['px'], 'y': img['py']+img['ph']-w, 'r': w};
    return handles;
};

CanvasHandler.prototype.drawImage = function(img)
{
    var handler = this;

    handler.ctx.drawImage(img['img'], img['px'], img['py'], img['pw'], img['ph']);

    var handles = handler.getHandles(img);
    handles.forEach(function(h) {
        handler.ctx.beginPath();
        handler.ctx.rect(h['x'], h['y'], h['r'], h['r']);
        handler.ctx.closePath();
        handler.ctx.stroke();
    });
};

CanvasHandler.prototype.savePicture = function(context)
{
    var _canvas = document.createElement('canvas');
    _canvas.width = context.cw;
    _canvas.height = context.ch;

    var _ctx = _canvas.getContext('2d')
    context.imgs.forEach(function(img) {
        _ctx.drawImage(img['img'], img['px'], img['py'], img['pw'], img['ph']);
    });

    if (context.effect != null) context.effect.apply(_canvas);

    var dataURL = _canvas.toDataURL("image/png");
    //window.location = dataURL;
    dataURL = dataURL.replace("image/png", "image/octet-stream");
    document.location.href = dataURL;
};

CanvasHandler.prototype.setEffect = function(effect_object)
{
    this.effect = effect_object;
};

CanvasHandler.prototype.removeEffect = function()
{
    this.effect = null;
};
