/**
 * Created by pery on 15/07/14.
 */
jewel.webgl = (function () {

    function createContex( canvas, isDebug ) {
        var gl = canvas.getContext('webgl') ||
                 canvas.getContext('experimetal-webgl') ;
        isDebug && ( gl = webGLDDebugUtils.makeDebugContext(gl) );
        return gl;
    }



    return {
        createContext : createContex
    }



})();
