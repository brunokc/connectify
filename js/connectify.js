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

// Find any external SVG and inline them into the primary one.
// Currently we only look for external SVGs onlin in <image> tags.
async function inlineSVGAsync(svg) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svg, "text/xml");
    const images = doc.getElementsByTagName("image");
    for (var i = 0; i < images.length; i++) {
        let innersvg = images[i].href.baseVal;
        if (innersvg.endsWith(".svg")) {
            const innerElement = await fetch(innersvg);
            const innerContent = await innerElement.text();
            images[i].setAttribute("href", encodeSVG(innerContent));
        }
    }

    const inlinedSvg = doc.documentElement.outerHTML;
    return inlinedSvg;
}

async function generateCardAsync() {
    var ssid = $('#ssid').val();
    var enc = $('#enc').val();
    var password = (enc != 'nopass' ? $('#password').val() : '');
    var templateObj = $('#templateCarousel').find('div.active').find('object')[0];
    var template = templateObj.dataset.template;
    var hidden = $('#hidden').is(':checked');

    var qrcodeData = generateQRCode(ssid, enc, password, hidden);

    var cardData = {
        ssid: ssid,
        encryption: enc,
        password: password,
        template: template,
        templateUrl: "./templates/" + template,
        qrcodeData: qrcodeData,
    };

    var contents = await generateCardFromTemplateAsync(cardData);
    encodedSVG = encodeSVG(await inlineSVGAsync(contents));
    var objtag = document.createElement("object");
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
        .replace("qrcode-placeholder.png", encodeSVG(cardData.qrcodeData))
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
