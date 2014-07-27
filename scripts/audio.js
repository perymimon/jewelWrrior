/**
 * Created by pery on 14/07/14.
 */
jewel.audio = (function(){
    var dom = jewel.dom,
        extension,
        sounds,
        activeSounds
        ;

    function initialize(){
        extension = formatTest();
        if(!extension){ return; }
        sounds = {};
        activeSounds = [];
    }



    function createAudio( name ){
        var el = new Audio( 'sounds/' + name + '.' + extension );
        dom.bind(el, 'ended', function () {
            this.currentTime = 0;

            cleanActive()
        });
        sounds[name] = sounds[name] || [];

        sounds[name].push(el);
        return el;
    }

    function cleanActive(){
        for(var i = 0 ; i < activeSounds.length; i++){
            if(activeSounds[i].ended){
                activeSounds.splice(i,1);
                i--;
            }
        }
    }

    function getAudioElement(name){
        var audio;
        if(sounds[name]){
            for( var i= 0, n= sounds[name].length; i < n; i++){
                audio = sounds[name][i];
                if( audio.ended ){
                    if (window.chrome) audio.load();
                    return audio;
                }
            }
        }
        return createAudio(name);
    }

    function formatTest(){
        var audio = new Audio(),
            types = [
//                ['ogg','audio/ogg; codecs="vorbis""'],
                ['mp3','audio/mp3']
            ]
            ;
        for (var i = 0; i < types.length; i++) {
            if( audio.canPlayType(types[i][1]) == 'probably' ){
                return types[i][0];
            }
        }
        for ( i = 0; i < types.length; i++) {
            if( audio.canPlayType(types[i][1]) == 'maybe' ){
                return types[i][0];
            }
        }
    }

    function play(name) {
        var audio = getAudioElement(name);

        audio.play();
        activeSounds.push(audio);
    }

    function stop(){
        for (var i=activeSounds.length-1;i>=0;i--) {
            activeSounds[i].stop();
        }
        activeSounds = [];
    }


    return {
        initialize:initialize
        ,play:play
        ,stop:stop
    }

})();
