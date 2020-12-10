export const base = n => Math.pow(10, Math.floor(Math.log10(Math.abs(n))));

export const isNumber = n => typeof n === "object" ? false : !isNaN(n);

export const estimateFontHeight = ctx => Math.ceil(ctx.measureText("Q").width + 0.5);

export const estimateStringWidth = (ctx, str) => Math.ceil(ctx.measureText(str.toString()).width + 0.5);

export const drawText = (ctx, msg) => {
    ctx.textAlign = "center";
    ctx.fillText(msg, ctx.canvas.originalWidth >> 1, ctx.canvas.originalHeight >> 1);
};

export const drawLines = (ctx, lines) => {
    if (!Array.isArray(lines)) lines = [lines];

    const drawLine = (x1, y1, x2, y2) => {
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
    };

    ctx.beginPath();
    lines.forEach(line => drawLine(line.x1, line.y1, line.x2, line.y2));
    ctx.stroke();
};

export const configureCanvas = (ctx, devicePixelRatio) => {
    ctx.canvas.style.width = `${ctx.canvas.width}px`;
    ctx.canvas.style.height = `${ctx.canvas.height}px`;

    ctx.canvas.originalWidth = ctx.canvas.width;
    ctx.canvas.originalHeight = ctx.canvas.height;

    ctx.canvas.width *= devicePixelRatio;
    ctx.canvas.height *= devicePixelRatio;

    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
};

export const generateLayout = (ctx, offsets) => {
    const {originalWidth, originalHeight} = ctx.canvas;
    const {top, right, bottom, left} = {...({top: 0, right: 0, bottom: 0, left: 0}), ...offsets};
    const augment = bounds => {
        bounds.width = bounds.right - bounds.left;
        bounds.height = bounds.bottom - bounds.top;
        bounds.center = {
            x: bounds.left + bounds.width / 2,
            y: bounds.top + bounds.height / 2,
        }
        return bounds;
    };
    return augment({
        top: 0,
        right: originalWidth,
        bottom: originalHeight,
        left: 0,
        content: augment({
            top,
            right: originalWidth - right,
            bottom: originalHeight - bottom,
            left,
        }),
    });
};
