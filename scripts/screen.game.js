/**
 * Created by pery on 04/07/14.
 */
jewel.screens["game-screen"] = (function(){
    var settings = jewel.settings
        ,board
        ,display
        ,input
        ,dom
        ,audio
        ,storage
        ,$
        ,firstRun = true
        ,paused
        ,cursor
        ,pauseStart
/*cnst*/,STORAGE_KEY = 'activeGameData'
        ,STORAGE_KEY_LAST_SCORE = 'lastScore'
        ,$pauseOverlay
    ;

    gameState = {};

    function startGame(resetState) {
        gameState = {
            level : 0,
            score : 0,
            startTimeStamp : 0, // time at start of level
            levelDuration : 0, // time to jewel over
            timer :   gameState.timer || 0 // setTimeout reference
        };

        var activeGame = storage.get(STORAGE_KEY)
            ,useActiveGame = activeGame && !resetState // de-morgan logic
            ,startJewels
        ;

        if( useActiveGame ){
//            useActiveGame = window.confirm('Do you want to continue your previous jewel?');
            gameState.level = activeGame.level;
            gameState.score = activeGame.score;
            gameState.levelDuration = activeGame.levelDuration;
            gameState.startTimeStamp = Date.now() -  activeGame.time;
            startJewels = activeGame.jewels;
        }

        updateGameInfo();
        board.initialize(startJewels,function () {
            display.initialize(function () {
                cursor = {
                    x:0,
                    y: 0,
                    selected:false
                };
                display.redraw(board.getBoard(), function () {
                  if(useActiveGame){
                      setLevelTimer();
                  }else{
                      advanceLevel();
                  }
                })
            })
        });
        paused = false;
        $pauseOverlay.style.display = 'none';

    }
    function setup(){
        dom = jewel.dom;
        audio = jewel.audio;
        board = jewel.board;
        display = jewel.display;
        storage = jewel.storage;
        $ = dom.$;
        $pauseOverlay =  dom.$('#jewel-screen .pause-overlay')[0];
        audio.initialize();

        dom.bind('footer button.exit', 'click', exitGame );
        dom.bind('footer button.pause', 'click', pauseGame );
        dom.bind('footer button.reset', 'click', resetGame );
        dom.bind('.pause-overlay', 'click', resumeGame );

        var input = jewel.input;
        input.initialize();
        input.bind('selectJewel', selectJewel );
        input.bind('moveUp', moveUp );
        input.bind('moveDown', moveDown );
        input.bind('moveLeft', moveLeft );
        input.bind('moveRight', moveRight );
    }

    function run(){
        if(firstRun){
            setup();
            firstRun = false;
        }
        startGame();
    }

    function updateGameInfo(){
        $('#jewel-screen .score span')[0].innerHTML = gameState.score;
        $('#jewel-screen .level span')[0].innerHTML = gameState.level;
    }


    function setLevelTimer( reset ){
        if( gameState.timer ){
            clearTimeout(gameState.timer);
            gameState.timer = 0;
        }
        if( reset ) {
            gameState.startTimeStamp = Date.now();
            gameState.levelDuration = settings.baseLevelTimer * Math.pow( gameState.level, -0.05 * gameState.level );
        }
        var delta = gameState.levelDuration - (Date.now() - gameState.startTimeStamp  )
            ;
        if( delta < 0 ){
               gameOver();
        }else{
            var $progress = $('#jewel-screen .time .indicator')[0]
                ,percent = (delta / gameState.levelDuration ) * 100
                ;
            $progress.style.width = percent + '%';
            gameState.timer = setTimeout( setLevelTimer, 30);
        }
//        saveGameData();

    }


    function exitGame(){
        pauseGame();
//        var confirmed = window.confirm("do you exit, it's ok?");
//        if(confirmed){
            saveGameData();
            jewel.showScreen('main-menu');
//        }else{
//            resumeGame();
//        }


    }

    function pauseGame() {
        if(paused){
            return;
        }
        $pauseOverlay.style.display = 'block';
        paused = true;
        pauseStart = Date.now();
        clearTimeout( gameState.timer );
        gameState.timer = 0;
        display.pause();
    }

    function resumeGame(){
        $pauseOverlay.style.display = 'none';
        paused = false;
        var pauseTime = Date.now()  -  pauseStart;
        gameState.startTimeStamp += pauseTime;
        setLevelTimer();
        display.resume( pauseTime );

    }



    function addScore( points ){
        var  nextLevelAt = Math.pow(
                settings.baseLevelScore,
                Math.pow( settings.baseLevelExp, gameState.level-1)
            );
        gameState.score += points;
        if( gameState.score >= nextLevelAt ){
            advanceLevel();
        }else{
            updateGameInfo();
        }
    }

    function advanceLevel(){
        audio.play('levelUp');
        gameState.level++;
        announce('Level ' + gameState.level );
        updateGameInfo();
        setLevelTimer( true );
        jewel.display.levelUp();
    }

    function announce( str ){
        var element = $('#jewel-screen .announcement')[0]
            ;
        element.innerHTML = str;
        dom.removeClass( element, 'zoomfade');
        setTimeout(function () {
            dom.addClass( element, 'zoomfade');
        },1);
    }

    function gameOver(){
        audio.play(STORAGE_KEY,'gameover');
        jewel.storage.set(STORAGE_KEY,null);
        jewel.storage.set(STORAGE_KEY_LAST_SCORE, gameState.score);
        jewel.display.gameOver(function () {
                announce(' Game Over');
                setTimeout(function () {
                    jewel.showScreen('high-scores');
                },2500);
            }
        );

    }

    function setCursor(x, y, select){
        cursor.x = x;
        cursor.y = y;
        cursor.selected = select;
        jewel.display.setCursor(x, y, select);
    }

    function selectJewel(x,y){
        if( paused ){
            return;
        }
        if(arguments.length == 0){
            selectJewel(cursor.x, cursor.y );
            return;
        }
        if(cursor.selected){
            var dx = Math.abs(x-cursor.x)
                ,dy = Math.abs(y-cursor.y)
                ,dist = dx+dy
                ;
            if(dist === 0){
                //deselected the selected jewel
                setCursor(x,y,false);
            }else if(dist == 1){
                //selected an adjacent jewel
                jewel.board.swap( cursor.x, cursor.y, x, y, playBoardEvents );
                setCursor(x,y, false);
            }else{
                // selected a different jewel
                setCursor(x,y,true);
            }
        }else{
            setCursor(x, y, true);
        }
    }

    function playBoardEvents( events ){
        // just in the firstTime
        // because the recursion i don't now if this is the firs time
        if(!events.notFirstTimeRun ){

            saveGameData();
            events.notFirstTimeRun = true;
        }
        if ( events.length> 0){
            var boardEvent = events.shift()
                ,next = function () {
                    playBoardEvents(events);
                }
                ;
            switch(boardEvent.type){
                case 'move':
                    display.moveJewels( boardEvent.data, next);
                    break;
                case 'remove':
                    audio.play('match');
                    display.removeJewels( boardEvent.data, next);
                    break;
                case 'refill':
                    announce('No moves!');
                    display.refill( boardEvent.data, next);
                    break;
                case 'score' :
                    addScore( boardEvent.data );
                    next();
                    break;
                case 'badswap':
                    audio.play('badswap');
                    next();
                    break;
                default :
                    next();
                    break;
            }

        }else{
            display.redraw(jewel.board.getBoard(), function () {
                //good to go again
            })
        }

    }

    function moveCursor(x,y){
        if( paused ) {
            return;
        }
        var settings = jewel.settings;
        if( cursor.selected){
            x +=cursor.x;
            y +=cursor.y;
            if(
                x>=0 && x < settings.cols &&
                    y>=0 && y < settings.rows
                ){
                selectJewel(x, y);
            }
        } else {
            x = (cursor.x + x + settings.cols ) % settings.cols;
            y = (cursor.y + y +settings.rows ) % settings.rows;
            setCursor(x, y, false);
        }
    }

    function moveUp(){
        moveCursor(0, -1);
    }
    function moveDown(){
        moveCursor(0, 1);
    }
    function moveLeft(){
        moveCursor(-1, 0);
    }
    function moveRight(){
        moveCursor(1, 0);
    }

    function saveGameData(){
        jewel.storage.set(STORAGE_KEY,{
            level : gameState.level,
            score : gameState.score,
            time : Date.now() - gameState.startTimeStamp,
            levelDuration : gameState.levelDuration,
            jewels : jewel.board.getBoard()
        })
    }

    function restoreGameData(){
        var activeGameObject = storage.get(STORAGE_KEY)
            ;
            gameState.level = activeGameObject.level;
            gameState.score = activeGameObject.score;
            gameState.levelDuration = activeGameObject.levelDuration;
            gameState.startTimeStamp = Date.now() -  activeGameObject.time;
            startJewels = activeGameObject.jewels;

    }

    function resetGame (){
        gameState.level = 0;
        startGame(true);

    }


    return{
        run:run
    }

})();
