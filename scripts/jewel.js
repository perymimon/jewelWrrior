var jewel  = (function(){
    var  scriptQueue = []
        ,numResourcesLoaded = 0
        ,numResources = 0
        ,executeRunning = false;

    var setting = {
        rows:8,
        cols:8,
        baseScore:100,
        numJewelTypes:7,
        controls:{
            //KEYBOARD
            KEY_UP:'moveUp'
            ,KEY_DOWN:'moveDown'
            ,KEY_LEFT:'moveLeft'
            ,KEY_RIGHT:'moveRight'
            ,KEY_ENTER:'selectJewel'
            ,KEY_SPACE:'selectJewel'
            // mouse an touch
            ,CLICK:'selectJewel'
            ,TOUCH:'selectJewel'
            //gamepad
            ,BUTTON_A:'selectJewel'
            ,LEFT_STICK_UP:'moveUp'
            ,RIGHT_STICK_DOWN:'moveDown'
            ,RIGHT_STICK_LEFT:'moveLeft'
            ,RIGHT_STICK_RIGHT:'moveRight'

        }
    };

    function executeScriptQueue(){
        var next = scriptQueue[0]
            ,first,script;
        if( next && next.loaded ){
            executeRunning = true;
            //remove the first element in the queue
            scriptQueue.shift();
            first = document.getElementsByTagName("script")[0];
            script = document.createElement("script");
            script.onload = function(){
                if ( next.callback ){
                    next.callback();
                }
                // try to execute more scripts
                executeScriptQueue();
            };
            script.src = next.src;
            first.parentNode.insertBefore(script, first);

        } else {
            executeRunning = false;

        }
    }

    function preload( src ){
        var image = new Image();
            image.src = src
        ;

    }

    function load (src, callback){
        var image,queueEntry
        ;
        numResources++;
        // add this resource to the execution queue
        queueEntry = {
            src: src,
            callback: callback,
            loaded: false
        };
        scriptQueue.push(queueEntry);
        image = new Image();
        image.onload = image.onerror = function(){
            numResourcesLoaded++;
        };
        queueEntry.loaded = true;
        if( !executeRunning){
            executeScriptQueue();
        }
        image.src = src;
    };

    /**
     * work only on apple products
     * */
    function isStandAlone(){
        return (window.navigator.standalone !== false );
    }


    function setup(){
        var dom = jewel.dom,
            $ = dom.$
        ;

        if( isStandAlone() ){
            jewel.showScreen("splash-screen");
        }else{
            jewel.showScreen("install-screen");
        }
        /*make environment fit for application*/
//        if(/Android/.test(navigator.userAgent)){
//            $("html")[0].style.height ="200%";
//            setTimeout(function () {
//                window.scrollTo(0,1);
//            });
//        }
        jewel.dom.bind(document,"touchmove", function (event) {
            event.preventDefault();
        });
    }

    function showScreen( screenId ){
        var dom = jewel.dom,
            $ = dom.$,
            activeScreen = $("#game .screen.active")[0],
            screen = $('#' + screenId)[0]
        ;
        if( !jewel.screens[screenId]){
            alert( screenId +" module is not loaded or implemented yet!");
            return;
        }
        activeScreen && dom.removeClass(activeScreen,"active");
        dom.addClass(screen, "active");
        jewel.screens[screenId].run();
    }

    function hasWebWorkers(){
        return ("Worker" in window);
    }

    function getLoadProgress(){
        return numResourcesLoaded / numResources;
    }

    return {
        load:load,
        setup:setup,
        showScreen:showScreen,
        isStandalone: isStandAlone,
        screens:{},
        settings:setting,
        hasWebWorker:hasWebWorkers,
        preload: preload,
        getLoadProgress: getLoadProgress
    }
})();
