
const hexToRgb = hex => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
};

const rgbToHex = rgb => {
    const hex = Number(rgb).toString(16);
    return hex.length < 2
        ? "0" + hex : hex;
};

const fullColorHex = (r,g,b) => rgbToHex(r) + rgbToHex(g) + rgbToHex(b);

/**
 *
 * @param {ImageData} input
 * @returns {{colorR: *, colorB: *, top: *, left: *, width: *, colorG: *, height: *}}
 */
const getImageDetailsFromImageData = input => {
    const pixelsColors = [];
    for (let index = 0; index < input.data.length; index += 4) {
        pixelsColors.push(fullColorHex(
            input.data[index],
            input.data[index + 1],
            input.data[index + 2]
        ));
    }

    const whiteColor = 'ffffff';
    let width = null;
    let height = null;
    let top = null;
    let left = null;
    let color = null;

    let isPreviousStringWhite = true;

    for (let hIndex = 0; hIndex < input.height; hIndex++) {
        let previousPixelColor = whiteColor;
        let isWhiteString = true;

        for (let wIndex = 0; wIndex < input.width; wIndex++) {
            const pixelColor = pixelsColors[hIndex * input.width + wIndex];
            const isWhite = pixelColor === whiteColor;

            if (!isWhite) {
                if (color === null) {
                    color = pixelColor;
                }

                if (top === null) {
                    top = hIndex;
                }

                if (left === null) {
                    left = wIndex;
                }

                if (isWhiteString) {
                    isWhiteString = false;
                }
            }

            if (isWhite && previousPixelColor !== whiteColor && width === null) {
                width = wIndex - left;
            }

            previousPixelColor = pixelColor;
        }

        if (!isWhiteString && width === null) {
            width = input.width - left;
        }

        if (isWhiteString && !isPreviousStringWhite && height === null) {
            height = hIndex - top;
        }

        isPreviousStringWhite = isWhiteString;
    }

    if (height === null) {
        height = input.height - top;
    }
    const rgbColor = hexToRgb('#' + color);

    return {
        top,
        height,
        left,
        width,
        colorR: rgbColor.r,
        colorG: rgbColor.g,
        colorB: rgbColor.b,
    }
};


/**
 * @param {String} imageSrc - base64 картинки, например ’data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...’
 * @returns {Promise}
 */
function traceImage(imageSrc) {
    return new Promise(resolve => {
        const image = new Image();
        image.addEventListener('load', () => {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');

            context.drawImage(image, 0, 0);

            const input = context.getImageData(0, 0, canvas.width, canvas.height);
            const imageData = getImageDetailsFromImageData(input);

            resolve(
`<div>
    <div style="
        position: absolute;
        width: ${imageData.width}px;
        height: ${imageData.height}px;
        top: ${imageData.top}px;
        left: ${imageData.left}px;
        background-color: rgb(${imageData.colorR}, ${imageData.colorG}, ${imageData.colorB});
    "></div>  
</div>`
            );
        });

        image.src = imageSrc;
    });
}