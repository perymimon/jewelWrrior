/**
 * Created by pery on 18/07/14.
 */
jewel.screens['high-scores'] = (function () {
    var firstRun = true
        ,STORAGE_KEY_LAST_SCORE = 'lastScore'
        ,STORAGE_KEY_SCORES = 'scores'
        , $
        ;

    function setup(){
         $ = jewel.dom.$;

        var backbutton = $('#high-scores button[name=back]')[0]
        ;
        jewel.dom.bind(backbutton,'click',function(){
            jewel.showScreen('main-menu');
        })
    }

    function run(){
        if(firstRun){
            setup();
            firstRun = false;
        }
        populateList();
        var score = jewel.storage.get(STORAGE_KEY_LAST_SCORE);
        if(score){
            checkScores(score);
            jewel.storage.set(STORAGE_KEY_LAST_SCORE,null);
        }
    }

    var numScores = 10;

    function getScores(){
        return jewel.storage.get(STORAGE_KEY_SCORES) || [];
    }

    function addScore( score, position){
        var scores = getScores(),
            name,entry
        ;

        name = prompt('please enter your name:');
        entry = {
            name: name
            ,score : score
        };
        scores.splice( position, 0, entry);
        jewel.storage.set(STORAGE_KEY_SCORES, scores.slice(0,numScores));
        populateList();

    }

    function checkScores(score){
        var scores = getScores();
        for (var i=0;i<scores.length; i++){
            if(score > scores[i].score){
                addScore(score, i );
                return;
            }
        }
        if(scores.length < numScores){
            addScore(score,scores.length);
        }
    }

    function populateList(){
        var scores = getScores()
            ,$list = $('#high-scores ol.score-list')[0]
            ,item, nameEl, scoreEl, i
            ;
        // make sure the list is  full
        for(i = scores.length; i<numScores; i++){
            scores.push({
                score:0
                ,name:'&#x2014;'
            })
        }
        $list.innerHTML = '';
        for(i=0;i<scores.length;i++){
            item = document.createElement('li');

            nameEl = document.createElement('span');
            nameEl.innerHTML = scores[i].name;

            scoreEl = document.createElement('span');
            scoreEl.innerHTML = scores[i].score;

            item.appendChild(nameEl);
            item.appendChild(scoreEl);
            $list.appendChild(item);

        }



    }

    return {
        run:run
    }

})();
