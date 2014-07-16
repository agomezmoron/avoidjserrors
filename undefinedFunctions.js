/**
 * Depends on jQuery. The aim of this function is avoiding errors if there are some call to an undefined function.
 * This function find all javascript calls in the dom and define it if it not defined yet.
 */
function findFunctionCalls(DOM) {
    var uniqueNames = {}
    var fnNameRegex = /((([a-zA-Z0-9\_\$\)])+)\.)?(([a-zA-Z0-9\_\$])+)( )?\((([a-zA-Z0-9\_\$\,\.\[\]]\{\})*)\)(\;|(\;\")|\")/g;
    // if the DOM is not defined in the call, we get it from document.
    if (DOM == undefined) {
       //DOM = document.head.outerHTML + document.body.outerHTML;
        DOM = $('head').text() + $('body').text();//  document.head.outerHTML + document.body.outerHTML;
    }
    // looking for matches
    var match = DOM.match(fnNameRegex);
    if (match != null) {
        // free memory
        DOM = undefined;
        for (var i = 0; i < match.length; i++) {
            var funcNameParts = match[i].split('(');
            var funcName = undefined;
            var isAnObject = false;
            // checking length to know if it has values
            if (funcNameParts.length >= 1) {
                funcNameParts = funcNameParts[0].split('.');
                // now we check if it is an object
                if (funcNameParts.length == 1) {
                    funcName = funcNameParts[0];
                } else {
                    // if it's an object, we mark it as an object
                    isAnObject = true;
                    funcName = funcNameParts[1];
                }
            }
            /*
             * We will just mark as a candidate to register if:
             *  - It is not an object method call AND
             *  - It is not a registered function AND
             *  - It wasn't registered as a candidate previously
             */
            if (!isAnObject && typeof window[funcName] !== "function" && !uniqueNames[funcName]) {
                uniqueNames.push(funcName);
            }
        }
        if (uniqueNames.length > 0) {
            for (var key in uniqueNames) {
                var name = uniqueNames[key];
                // Just we'll register the function if NOW it's not registered
                if (window[name] !== 'function') {
                    window[name] = function () {
                        ; // Empty function to avoid undefined calls
                    }
                }

            }
        }
    }
}

/**
 * Once the document is ready and we have the final DOM, we call findFunctionsCalls
 * and also define a preprocess for all ajax responses
 */
$(document).ready(function(){
    findFunctionCalls();
    $.ajaxSetup({
        dataFilter: function (data, type) {
            if (typeof data == 'string') {
                findFunctionCalls(data);
            } else {
                ; // TODO
            }
            return data;
        }
    });

});