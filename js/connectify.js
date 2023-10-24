function escapeString(string) {
    var to_escape = ['\\', ';', ',', ':', '"'];
    var hex_only = /^[0-9a-f]+$/i;
    var output = "";
    for (var i = 0; i < string.length; i++) {
        if ($.inArray(string[i], to_escape) != -1) {
            output += '\\' + string[i];
        }
        else {
            output += string[i];
        }
    }
    return output;
}

function generateQRCode(ssid, encryption, password, hidden) {
    // https://github.com/zxing/zxing/wiki/Barcode-Contents#wi-fi-network-config-android-ios-11
    var qrstring = 'WIFI:S:' + escapeString(ssid) + ';T:' + encryption +
        ';P:' + escapeString(password) + ';';
    if (hidden) {
        qrstring += 'H:true';
    }
    qrstring += ';';

    var typeNumber = 0; // autodetect
    var errorCorrectionLevel = 'L';
    var qr = qrcode(typeNumber, errorCorrectionLevel);
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

// Find any external SVG and inline them into the primary one.
// Currently we only look for external SVGs onlin in <image> tags.
async function inlineSVGAsync(svg, relativePath) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svg, "text/xml");
    const images = doc.getElementsByTagName("image");
    for (var i = 0; i < images.length; i++) {
        let innerImg = images[i].href.baseVal;
        const path = relativePath + "/" + innerImg;
        if (innerImg.endsWith(".svg")) {
            const innerElement = await fetch(path);
            const innerContent = await innerElement.text();
            images[i].setAttribute("href", encodeSVG(innerContent));
        } else if (innerImg.endsWith(".png")) {
            const innerContentDataUrl = await urlContentToBase64(path);
            images[i].setAttribute("href", innerContentDataUrl);
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

    // $('#showssid').text('SSID: ' + ssid);
    // $('#save').show();
    // $('#print').css('display', 'inline-block');

    var e = $('#download');
    e.attr('href', encodedSVG);
    e.attr('download', 'connectify-' + ssid + '.svg');
    e.css('display', 'inline-block');
}

async function generateCardFromTemplateAsync(cardData) {
    var req = await fetch(cardData.templateUrl);
    var contents = await req.text();
    contents = contents
        .replace("connectify-qrcode-placeholder.png", encodeSVG(cardData.qrcodeData))
        // .replace("{svg_qrcode_placeholder}", cardData.qrcodeData)
        .replace("{network_name}", cardData.ssid)
        .replace("{network_password}", cardData.password)

    return contents;
}

$(document).ready(function () {
    // Sample data for quick testing
    // $("#ssid").val("My Home Network");
    // $("#password").val("MyPassw0rd");
});
