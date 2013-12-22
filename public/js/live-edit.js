var socket = io.connect('http://localhost');
    /*
     * socket.on('news', function (data) {
     *     console.log(data);
     *     socket.emit('my other event', { my: 'data' });
     * });
     */

    socket.on('change', function (data) {
        html = window.markdown.toHTML( data );
        $('#contentWrapper').html( html );
    });


