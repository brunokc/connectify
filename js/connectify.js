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
    var key = (enc != 'nopass' ? $('#key').val() : '');
    var templateObj = $('#templateCarousel').find('div.active').find('object')[0];
    var template = templateObj.dataset.template;
    var hidden = $('#hidden').is(':checked');

    var qrcodeData = generateQRCode(ssid, enc, key, hidden);

    var cardData = {
        ssid: ssid,
        encryption: enc,
        password: key,
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

/*()
function generate() {
    var ssid = $('#ssid').val();
    var hidden = $('#hidden').is(':checked');
    var enc = $('#enc').val();
    if (enc != 'nopass') {
        var key = $('#key').val();
        $('#showkey').text(enc + ' Passphrase: ' + key);
    } else {
        var key = '';
        $('#showkey').text('');
    }
    // https://github.com/zxing/zxing/wiki/Barcode-Contents#wi-fi-network-config-android-ios-11
    var qrstring = 'WIFI:S:' + escape_string(ssid) + ';T:' + enc + ';P:' + escape_string(key) + ';';
    if (hidden) {
        qrstring += 'H:true';
    }
    qrstring += ';';
    $('#linkcard').empty();
    $('#linkcard').qrcode(qrstring);
    $('#showssid').text('SSID: ' + ssid);
    $('#save').show();
    $('#print').css('display', 'inline-block');

    var canvas = $('#linkcard canvas');
    if (canvas.length == 1) {
        var data = canvas[0].toDataURL('image/png');
        var e = $('#export');
        e.attr('href', data);
        e.attr('download', ssid + '-qrcode.png');
        // e.show() sets display:inline, but we need inline-block
        e.css('display', 'inline-block');
    }
};

function save() {
    var ssid = $('#ssid').val();
    if (!ssid) return;
    var hidden = $('#hidden').is(':checked');
    var enc = $('#enc').val();
    var key = $('#key').val();
    var storage = $.localStorage('qificodes');
    if (!storage) storage = {};
    storage[ssid] = { 'hidden': hidden, 'enc': enc, 'key': key };
    $.localStorage('qificodes', storage);
    loadhistory();
};

function load(ssid) {
    var storage = $.localStorage('qificodes');
    if (ssid in storage) {
        $('#ssid').val(ssid);
        $('#enc').val(storage[ssid]['enc']);
        $('#key').val(storage[ssid]['key']);
        $('#hidden').prop('checked', storage[ssid]['hidden']);
        generate_card();
    }
};

function loadhistory() {
    var storage = $.localStorage('qificodes');
    if (storage) {
        var history = $('#history-drop ul.dropdown-menu');
        var ssids = Object.keys(storage);
        history.empty();
        for (var i = 0; i < ssids.length; i++) {
            history.append('<li role="presentation"><a role="menuitem" tabindex="-1" href="#" class="history-item">' + ssids[i] + '</a></li>');
        }
        history.append('<li role="presentation" class="divider"></li>');
        history.append('<li role="presentation"><a role="menuitem" tabindex="-1" href="#" class="history-clear">clear history</a></li>');

        history.on('click', 'a.history-item', function (e) {
            e.preventDefault();
            load($(this).text());
        });
        history.on('click', 'a.history-clear', function (e) {
            e.preventDefault();
            clearhistory();
        });
        $('#history-drop').show();
    }
};

function clearhistory() {
    $.localStorage('qificodes', null);
    $('#history-drop').hide();
};
*/

$(document).ready(function () {
    $('#form').submit(function () {
        generateCardAsync();
        return false;
    });

    $('#save').click(function () {
        save();
    });
    // $('#display-key').click(function () {
    //   var $key = $("#key");
    //   if ($key.attr('type') === 'password') {
    //     $key.attr('type', 'text');
    //     $("#display-key-icon").attr("class", "glyphicon glyphicon-eye-close");
    //   } else {
    //     $key.attr('type', 'password');
    //     $("#display-key-icon").attr("class", "glyphicon glyphicon-eye-open");
    //   }
    // });
    $('#enc').change(function () {
        if ($(this).val() != 'nopass') {
            $('#key-p').show();
            $('#key').attr('required');
        }
        else {
            $('#key-p').hide();
            $('#key').removeAttr('required');
        }
    });
    $('#form').tooltip({
        selector: "[data-toggle=tooltip]"
    });
    // loadhistory();

    // Sample data for quick testing
    // $("#ssid").val("My Home Network");
    // $("#key").val("MyPassw0rd");
});

// Service Worker installation
// if ('serviceWorker' in navigator) {
//     window.addEventListener('load', function () {
//         navigator.serviceWorker.register('/sw.js', { scope: './' }).then(function (registration) {
//             console.log('[Service Worker] Successfully installed');
//         }).catch(function (error) {
//             console.log('[Service Worker] Installation failed:', error);
//         })
//     });
// }
