(function( window, document, undefined ) {
    var eventManager = null,
        observer = null;

    function taskCommit( context, fn, params ) {
        var date = new Date(),
            year = date.getFullYear(),
            mouth = date.getMonth(),
            day = date.getDate(),
            hour = date.getHours(),
            minutes = date.getMinutes(),
            seconds = date.getSeconds();

        var funcName =
            "$" + year + "$" + mouth + "$" + day +
            "$" + hour + "$" + minutes + "$" + seconds +
            "$" + Math.floor( Math.random() * ( 10000 + 1 ) ) + "$timerTask";

        window[funcName] = (function( funcName, context, fn, params ) {

            return function() {
                fn.apply( context, params );
                delete window[funcName];
            }
        })( funcName, context, fn, params );

        setTimeout( funcName.concat( "();" ) , 10 );
    }

    function Subject( context, fn ) {
        this.context = context;
        this.fn = fn;

        this.beforeFn = [];
        this.afterFn = [];
        this.cache = {};
    }

    Subject.prototype.setCache = function( key, val ) {
        this.cache[key] = val;
    };

    Subject.prototype.before = function( fn ) {
        this.beforeFn.push( fn );
    };

    Subject.prototype.after = function( fn ) {
        this.afterFn.push( fn );
    };

    Subject.prototype.notify = function( params ) {
        var curObject = this;
        params.push( this.cache );

        this.beforeFn.forEach(function( fn ) {
            taskCommit( curObject.context, fn, params );
        });

        taskCommit( this.context, this.fn, params );

        this.afterFn.forEach(function( fn ) {
            taskCommit( curObject.context, fn, params );
        });
    };


    function EventManager() {
        this._route = {};
    }

    /**
     * @param {string} id
     * @param {object} context
     * @param {string} event
     * @param {function} fn
     * @return {{setCache, before, after}}
     */
    EventManager.prototype.add = function( id, context, event, fn ) {
        if( !this._route.hasOwnProperty( event ) ) this._route[event] = {};

        if( !context ) context = window;
        var subject = new Subject( context, fn );

        this._route[event][id] = subject;
        return (function( subject ) {
            return {
                setCache: function( key, val ) {
                    subject.setCache( key, val );
                },
                /**
                 * @param {function} fn
                 * @return {{setCache, before, after}}
                 */
                before: function( fn ) {
                    if( fn instanceof Function ) subject.before( fn );
                    return this;
                },
                /**
                 * @param {function} fn
                 * @return {{setCache, before, after}}
                 */
                after: function( fn ) {
                    if( fn instanceof Function ) subject.after( fn );
                    return this;
                }
            }
        })( subject );
    };

    /**
     * @param {string} id
     * @param {string} event
     */
    EventManager.prototype.get = function( id, event ) {
        if( id && this._route[event] ) return this._route[event][id];
        else return this._route[event];
    };

    /**
     * @param {string} id
     * @param {string} event
     * @return {boolean}
     */
    EventManager.prototype.remove = function( id, event ) {
        var route = this._route;
        if( !route.hasOwnProperty( event ) ) return false;

        delete this._route[event][id];
        return true;
    };


    function Observer() {
        eventManager = new EventManager();
    }

    /**
     * @param {string} id
     * @param {object} context
     * @param {string} event
     * @param {function} fn
     * @return {{setCache, before, after}}
     */
    Observer.prototype.bind = function( id, context, event, fn ) {
        return eventManager.add( id, context, event, fn );
    };

    /**
     * @param {string} id
     * @param {string} event
     * @return {boolean}
     */
    Observer.prototype.toggle = function( id, event ) {
        var subject = eventManager.get( id, event );
        if( undefined === subject ) return false;

        var params;
        if( arguments.length < 3 ) {
            params = [];

        } else if( 3 == arguments.length ) {
            if( arguments[2] instanceof Array ) params = arguments[2];
            else params = [arguments[2]];

        } else {
            params = Array.prototype.slice.call( arguments );
            params.splice( 0, 2 );
        }

        subject.notify( params );
        return true;
    };

    /**
     * @param {string} id
     * @param {string} event
     * @return {boolean}
     */
    Observer.prototype.unbind = function( id, event ) {
        return eventManager.remove( id, event );
    };

    /**
     * @return {Observer}
     */
    ( this || window ).getObserver = function() {
        if( observer != null ) return observer;
        else {
            observer = new Observer();
            return observer;
        }
    };

    /**
     * @param {function(Observer=)} controllerInit
     * @returns {{go: go, back: back, clear: clear}}
     */
    ( this || window ).getController = function( controllerInit ) {
        var observer = getObserver(),
            myHistory = [],
            isBack = false;

        controllerInit( observer );
        return {
            go: function( id, params ) {
                if( myHistory.length >= 1 && id == myHistory[myHistory.length - 1].id ) return;
                if( !observer.toggle( id, "start", params ) ) return;

                myHistory.push({
                    id: id,
                    params: params
                });

                if( myHistory.length < 2 ) return;
                if( isBack ) {
                    isBack = false;
                    return;
                }

                var theLast = myHistory[myHistory.length - 2];
                observer.toggle( theLast.id, "stop", theLast.params );
            },
            back: function() {
                if( myHistory.length <= 0 ) return;
                var theLast = myHistory.pop();
                observer.toggle( theLast.id, "stop", theLast.params );

                if( myHistory.length <= 0 ) {
                    isBack = false;
                    return;
                }

                var backTo = myHistory.pop();
                isBack = true;

                this.go( backTo.id, backTo.params );
            },
            clear: function() {
                myHistory = [];
            }
        }
    }
})( window, document );