/**
 * Created by pery on 01/07/14.
 */

jewel.board = (function(){

    var worker,
        messageCount,
        callbacks,
        jewelsBoard,
        rows,
        cols
    ;

    function initialize( startJewels, callback ){
        rows = jewel.settings.rows;
        cols = jewel.settings.cols;
        messageCount = 0;
        callbacks = [];
        if(!worker){
            worker = new Worker('scripts/board.worker.js');
            jewel.dom.bind( worker, "message", messageHandler );
        }
        var data = {
            settings : jewel.settings
            ,startJewels : startJewels
        };
        post( "initialize", data , callback );
    }


    function post(command, data, callback){
        callbacks[messageCount] = callback;
        worker.postMessage({
            id : messageCount,
            command : command,
            data : data
        });
        messageCount++;
    }

    function swap( x1, y1, x2, y2, callback ){
        post("swap", {
                        x1 : x1,
                        y1 : y1,
                        x2 : x2,
                        y2 : y2
        }, callback);
    }

    function messageHandler( event ){
        // uncomment to log worker messages
        // console.log(event.data)

        var message = event.data;
        jewelsBoard = message.jewels;

        if( callbacks[message.id]){
            callbacks[message.id](message.data);
            delete callbacks[message.id];
        }
    }



    function print() {
        var str = "\n\r";
        for (var y = 0; y < rows; y++) {
            for (var x = 0; x < cols; x++) {
                str += getJewel(x, y) + " ";
            }
            str += "\r\n";
        }

        console.log(str);
    }

    function getJewel(x, y) {
        if (x < 0 || x > cols - 1 || y < 0 || y > rows - 1) {
            return -1;
        }
        return jewelsBoard[x][y];
    }

    /*
     * create a copy of the jewel board
     * */
    function getBoard(){
        var copy = [],
            x
            ;
        for( x = 0; x < cols; x++ ){
            copy[x] = jewelsBoard[x].slice(0);
        }
        return copy;


    }
    return {
        initialize : initialize,
        swap : swap,
        getBoard : getBoard,
        print: print
    }

})();
