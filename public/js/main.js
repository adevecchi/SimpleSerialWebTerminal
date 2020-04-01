(function() {

    const socket = io();

    socket.on('received data', function(data) {
        if (data == 'Port Name not defined.') {
            $('#cmd-port').text('Open Port').removeClass('btn-danger').addClass('btn-success');
        }
        $('#received-data').val(data + '\n' + $('#received-data').val());
    });

    $('#cmd-port').on('click', function (evt) {
        var cmd = $(this).text(),
            port = $('#port').val();

        if (cmd == 'Open Port') {
            if (port.length < 4) {
                alertify.set('notifier','position', 'top-right');
                alertify.error('Port Name not defined.');
                return false;
            }
            $(this).text('Close Port').removeClass('btn-success').addClass('btn-danger');
            socket.emit('open port', { port: port, baudrate: $('#baudrate').val() });
        } else {
            $(this).text('Open Port').removeClass('btn-danger').addClass('btn-success');
            socket.emit('close port', 'Port is closed.');
        } 
    });

    $('#message').on('keydown', function (evt) {
        if (evt.keyCode == 13) {
            $('#send-message').trigger('click');
            return false;
        }
    });

    $('#send-message').on('click', function (evt) {
        socket.emit('send data', $('#message').val());
    });

    $('#clear').on('click', function(evt) {
        $('#received-data').val('');
    });

})();