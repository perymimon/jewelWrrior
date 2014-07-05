jewel.screens["splash-screen"] = (function(){
    var firstRun = true;

    function checkProgress(){
        var  $ = jewel.dom.$;
        var  p = jewel.getLoadProgress() * 100;
        $("#splash-screen .indicator")[0].style.width = p + '%';
        if( p == 100 ){
            setup();
        }else{
            setTimeout( checkProgress, 30);
        }
    }

    function setup(){
        var dom = jewel.dom;
        var $ = dom.$;
        var screen = $("#splash-screen")[0];

        $(".continue", screen)[0].style.display = "block";
        dom.bind(screen, "click", function(){
            jewel.showScreen("main-menu");
        })
    }



    function run(){
        if(firstRun){
            checkProgress();
            firstRun = false;
        }
    }

    return{
        run:run
    }

})();
