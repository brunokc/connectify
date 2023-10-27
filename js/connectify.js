function escapeString(string) {
    const to_escape = ['\\', ';', ',', ':', '"'];
    const hex_only = /^[0-9a-f]+$/i;
    let output = "";
    for (let i = 0; i < string.length; i++) {
        if ($.inArray(string[i], to_escape) != -1) {
            output += '\\' + string[i];
        } else {
            output += string[i];
        }
    }
    return output;
}

function generateQRCode(ssid, encryption, password, hidden) {
    // https://github.com/zxing/zxing/wiki/Barcode-Contents#wi-fi-network-config-android-ios-11
    let qrstring = 'WIFI:S:' + escapeString(ssid) + ';T:' + encryption +
        ';P:' + escapeString(password) + ';';
    if (hidden) {
        qrstring += 'H:true';
    }
    qrstring += ';';

    const typeNumber = 0; // autodetect
    const errorCorrectionLevel = 'L';
    const qr = qrcode(typeNumber, errorCorrectionLevel);
    qr.addData(qrstring);
    qr.make();
    return qr.createSvgTag();
}

function encodeSVG(svg) {
    return "data:image/svg+xml," + encodeURIComponent(svg);
}

// From https://stackoverflow.com/questions/44698967/requesting-blob-images-and-transforming-to-base64-with-fetch-api
async function urlContentToBase64(url) {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise(callback => {
        let reader = new FileReader();
        reader.onload = function() { callback(this.result) };
        reader.readAsDataURL(blob);
    });
}

// Find any external resources (SVGs and PNGs for now) and inline them into the SVG.
// Currently we only look for external resources in <image> elements.
async function inlineSVGAsync(svg, relativePath) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svg, "text/xml");
    const images = doc.getElementsByTagName("image");
    for (let img of images) {
        let innerImg = img.href.baseVal;
        const path = relativePath + "/" + innerImg;
        if (innerImg.endsWith(".svg")) {
            const innerElement = await fetch(path);
            const innerContent = await innerElement.text();
            img.setAttribute("href", encodeSVG(innerContent));
        } else if (innerImg.endsWith(".png")) {
            const innerContentDataUrl = await urlContentToBase64(path);
            img.setAttribute("href", innerContentDataUrl);
        }
    }

    const inlinedSvg = doc.documentElement.outerHTML;
    return inlinedSvg;
}

async function generateCardAsync() {
    const ssid = $('#ssid').val();
    const encryption = $('#encryption').val();
    const password = (encryption != 'nopass' ? $('#password').val() : '');
    const templateObj = $('#templateCarousel').find('div.active').find('object')[0];
    const templateUrl = templateObj.data;
    const url = new URL(templateUrl);
    const relativePath = url.pathname.substring(0, url.pathname.lastIndexOf("/"));

    const hidden = $('#hidden').is(':checked');

    const qrcodeData = generateQRCode(ssid, encryption, password, hidden);

    const cardData = {
        ssid: ssid,
        encryption: encryption,
        password: password,
        templateUrl: templateUrl,
        relativePath: relativePath,
        qrcodeData: qrcodeData,
    };

    const contents = await generateCardFromTemplateAsync(cardData);
    const encodedSVG = encodeSVG(await inlineSVGAsync(contents, cardData.relativePath));

    const objtag = document.createElement("object");
    objtag.type = "image/svg+xml";
    objtag.data = encodedSVG;
    $('#linkcard').html(objtag);

    const e = $('#download');
    e.attr('href', encodedSVG);
    e.attr('download', 'connectify-linkcard-' + ssid + '.svg');
}

async function generateCardFromTemplateAsync(cardData) {
    const req = await fetch(cardData.templateUrl);
    let contents = await req.text();
    contents = contents
        .replace("connectify-qrcode-placeholder.png", encodeSVG(cardData.qrcodeData))
        .replace("{network_name}", cardData.ssid)
        .replace("{network_password}", cardData.password)

    return contents;
}

$(document).ready(function () {
    // Sample data for quick testing
    // $("#ssid").val("My Home Network");
    // $("#password").val("MyPassw0rd");
});
