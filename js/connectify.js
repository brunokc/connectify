function escape_string(string) {
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
    //if (hex_only.test(output)) {
    //    output = '"'+output+'"';
    //}
    return output;
}

function generate_qrcode(ssid, encryption, password, hidden) {
    // https://github.com/zxing/zxing/wiki/Barcode-Contents#wi-fi-network-config-android-ios-11
    var qrstring = 'WIFI:S:' + escape_string(ssid) + ';T:' + encryption +
        ';P:' + escape_string(password) + ';';
    if (hidden) {
        qrstring += 'H:true';
    }
    qrstring += ';';
    $('#linkcard').empty();
    $('#linkcard').qrcode(qrstring);

    var canvas = $('#linkcard canvas');
    if (canvas.length == 1) {
        var data = canvas[0].toDataURL('image/png');
        return data;
    }
    return null;
}

function generate_card() {
    var ssid = $('#ssid').val();
    var enc = $('#enc').val();
    var key = (enc != 'nopass' ? $('#key').val() : '');
    var templateObj = $('#templateCarousel').find('div.active').find('object')[0];
    var template = templateObj.data.substring(templateObj.data.lastIndexOf('/') + 1);
    var hidden = $('#hidden').is(':checked');

    var qrcode_data = generate_qrcode(ssid, enc, key, hidden);

    // $('#showssid').text('SSID: ' + ssid);
    // $('#save').show();
    // $('#print').css('display', 'inline-block');

    // var e = $('#export');
    // e.attr('href', qrcode_data);
    // e.attr('download', ssid + '-qrcode.png');
    // // e.show() sets display:inline, but we need inline-block
    // e.css('display', 'inline-block');


}

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

$(document).ready(function () {
    $('#form').submit(function () {
        generate_card();
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
});

// Service Worker installation
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
        navigator.serviceWorker.register('/sw.js', { scope: './' }).then(function (registration) {
            console.log('[Service Worker] Successfully installed');
        }).catch(function (error) {
            console.log('[Service Worker] Installation failed:', error);
        })
    });
}