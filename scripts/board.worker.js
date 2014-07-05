/**
 * Created by pery on 01/07/14.
 */
var jewel = {};
importScripts("board.js");

/*
* from main -> worker
* {
*  id:<number>
*  command : <string>
*  data : <any>
* }
*
*  from worker -> main
*  {
*    id : <number>
*    data : <any>
*    jewel: <array>
*
* */


addEventListener("message", function ( event ) {
    var board = jewel.board,
        message = event.data
    ;

    switch (message.command){
        case "initialize":
            jewel.settings = message.data;
            board.initialize( callback );
            break;
        case "swap":
            board.swap (
                message.data.x1,
                message.data.y1,
                message.data.x2,
                message.data.y2,
                callback
            );
            break;
    }

    function callback(data){
        postMessage({
            id : message.id,
            data : data,
            jewels : board.getBoard()
        })
    }

});



