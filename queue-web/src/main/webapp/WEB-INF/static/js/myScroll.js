(function( window, document, Math, undefined ) {
    var util = {
        nodeEval: (function() {
            var originNode = document.createElement( "section" );

            return function( nodeString ) {
                originNode.innerHTML = nodeString;
                return originNode.children[0];
            }
        })(),
        queryAssert: function( selector, from ) {
            var el = ( from || document ).querySelector( selector );
            if( el ) return el;
            else {
                throw new Error({
                    message: "the specified node is not found",
                    selector: selector,
                    from: from
                });
            }
        },
        isNumber: function( number ) {
            return typeof number == "number" || number instanceof Number;
        },
        isArray: function( array ) {
            return array instanceof Array;
        },
        isArrayLike: function( arrayLike ) {
            return arrayLike
                && arrayLike.hasOwnProperty( "length" )
                && this.isNumber( arrayLike.length )
                && arrayLike.length >= 0;
        },
        each: function( collection, fn ) {
            if( this.isArray( collection ) ) {
                collection.forEach( fn );

            } else if( this.isArrayLike( collection ) ) {
                Array.prototype.forEach.call( collection, fn );

            } else if( collection ) {
                (function() {
                    var step, index = 0;

                    for( step in collection ) {
                        if( !collection.hasOwnProperty( step ) ) continue;
                        fn( collection[step], step, collection, index );
                        index += 1;
                    }
                })();
            }
        },
        bind: function( node, event, fn ) {
            node.addEventListener( event, fn, false );
        }
    };

    var eventUtil = {
        mapper: {},
        add: function( event, fn ) {
            if( !this.mapper.hasOwnProperty( event ) ) this.mapper[event] = [];
            this.mapper[event].push( fn );
        },
        trigger: function( event ) {
            var fns = this.mapper[event];
            
            util.each(fns, function( fn ) {
                fn();
            });
        }
    };
    
    function MyScroll( el, opts ) {
        var wrapper = util.queryAssert( el ),
            docElem = document.documentElement,
            scrollArea = util.queryAssert( "div.scroller", wrapper );

        wrapper.appendChild( util.nodeEval( "<div class=\"scrollBarContainer\"><div class=\"scrollBar\"></div></div>" ) );
        var scrollBarWrapper = util.queryAssert( "div.scrollBarContainer", wrapper ),
            scrollBar = util.queryAssert( "div.scrollBar", scrollBarWrapper );
        
        this.components = {
            wrapper: wrapper,
            docElem: docElem,
            scrollArea: scrollArea,
            scrollBarWrapper: scrollBarWrapper,
            scrollBar: scrollBar
        };

        this.options = {
            newY: 0,
            lastPointY: 0,
            startPointY: 0,
            mouseMoveSpeed: 20,
            fadeScrollBar: true
        };

        // stop to scrolling if true
        this._isStopScroll = false;
        // active "_move" and "_end" function if true
        this._isMouseMove = false;

        var that = this;
        util.each(opts, function( val, name ) {
            that.options[name] = val;
        });

        this.refresh();
        this._initWheel();
        this._initEvent();
    }

    MyScroll.prototype = {
        handleEvent: function( event ) {
            switch( event.type ) {
                case "wheel":
                case "mousewheel":
                case "DOMMouseScroll":
                    if( !this._isStopScroll ) this._wheel( event );
                    break;

                case "mousedown":
                case "touchstart":
                    this._start( event );
                    break;

                case "mousemove":
                case "touchmove":
                    if( this._isMouseMove ) this._move( event );
                    break;

                case "mouseleave":
                case "mouseup":
                case "touchend":
                case "touchcancel":
                    if( this._isMouseMove ) this._end( event );
                    break;
            }
        },
        _initEvent: function() {
            this.on("scrollStart", function() {
                if( this.options.fadeScrollBar ) this._fade();
            });
            
            this.on("scrollEnd", function() {
                if( this.options.fadeScrollBar ) this._fade( true );
                this._isStopScroll = false;
            });

            this.on("beforeScrollStart", function() {
                if( this.options.fadeScrollBar ) this._fade();
                this._isStopScroll = true;
                this._isMouseMove = true;
            });

            this.on("scrollCancel", function() {
                if( this.options.fadeScrollBar ) this._fade( true );
                this._isStopScroll = false;
                this._isMouseMove = false;
            });
        },
        _initWheel: function() {
            var wrapper = this.components.wrapper;

            util.bind( wrapper, "wheel", this );
            util.bind( wrapper, "mousewheel", this );
            util.bind( wrapper, "DOMMouseScroll", this );

            util.bind( wrapper, "mousedown", this );
            util.bind( wrapper, "mouseleave", this );
            util.bind( wrapper, "mousemove", this );
            util.bind( wrapper, "mouseup", this );

            util.bind( wrapper, "touchstart", this );
            util.bind( wrapper, "touchmove", this );
            util.bind( wrapper, "touchend", this );
            util.bind( wrapper, "touchcancel", this );
        },
        _start: function( event ) {
            event.preventDefault();
            event.stopPropagation();

            if( "touches" in  event ) {
                this.options.startPointY = Math.round( -event["touches"][0].clientY );
                this.options.lastPointY = Math.round( -event["touches"][0].clientY );

            } else {
                this.options.startPointY = -event.clientY;
                this.options.lastPointY = -event.clientY;
            }

            eventUtil.trigger( "beforeScrollStart" );
        },
        _move: function( event ) {
            event.preventDefault();
            event.stopPropagation();

            var clientY;
            if( "touches" in event ) clientY = Math.round( event["touches"][0].clientY );
            else clientY = Math.round( event.clientY );

            var options = this.options,
                newY = this.options.newY,
                maxScrollY = this.options.scrollMaxY,
                incremental = options.lastPointY + clientY;

            console.log( event );

            if( newY + incremental < 0 && newY + incremental > maxScrollY ) newY += incremental;
            else newY = Number( ( newY + Number( ( incremental * .2 ).toFixed( 2 ) ) ).toFixed( 2 ) );

            options.lastPointY = -clientY;
            this.scrollTo( newY );
        },
        _end: function( event ) {
            event.preventDefault();
            event.stopPropagation();

            var newY = this.options.newY,
                maxScrollY = this.options.scrollMaxY;

            if( newY > 0 ) {
                newY = 0;
            } else if( newY < maxScrollY ) {
                newY = maxScrollY;
            }

            this.scrollTo( newY );
            eventUtil.trigger( "scrollCancel" );
        },
        _fade: function( isHide ) {
            var scrollBarWrapperStyle = this.components.scrollBarWrapper.style,
                time = isHide ? 500 : 250;

            isHide = isHide ? "0" : "1";

            scrollBarWrapperStyle.transitionDuration = time + "ms";
            scrollBarWrapperStyle.opacity = isHide;
            // scrollBarWrapperStyle.visible = +isHide;
        },
        _wheel: function( event ) {
            var newY, wheelDeltaY,
                mouseSpeed = this.options.mouseMoveSpeed,
                maxScrollY = this.options.scrollMaxY;

            if( undefined === this._fadeTimer ) {
                eventUtil.trigger( "scrollStart" );
            }
            
            clearTimeout( this._fadeTimer );
            this._fadeTimer = setTimeout(function() {

                eventUtil.trigger( "scrollEnd" );
                this._fadeTimer = undefined;

            }.bind( this ), 400);


            if( "deltaY" in event ) {
                if( 1 == event.deltaMode ) {
                    wheelDeltaY = -event.deltaY * mouseSpeed;
                } else {
                    wheelDeltaY = -event.deltaY;
                }
                
            } else if( "wheelDelta" in event ) {
                wheelDeltaY = event.wheelDelta / 120 * mouseSpeed;
                
            } else {
                return;
            }

            newY = this.options.newY + Math.round( wheelDeltaY );
            if( newY > 0 ) {
                newY = 0;
            } else if( newY < maxScrollY ) {
                newY = maxScrollY;
            }

            event.preventDefault();
            event.stopPropagation();

            this.scrollTo( newY );
        },
        scrollTo: function( scrollY ) {
            var Sd = this.description.sd,
                scrollBar = this.components.scrollBar,
                scrollArea = this.components.scrollArea;

            if( Sd >= 1 ) return;
            
            this.options.newY = scrollY;
            scrollBar.style.transform = "translateY(" + ( -scrollY * Sd ) + "px)";
            scrollArea.style.transform = "translateY(" + scrollY + "px)";
        },
        scrollToElement: function() {
            
        },
        refresh: function() {
            var windowHeight = window.innerHeight,
                documentHeight = this.components.scrollArea.scrollHeight,
                scrollBarWrapperHeight = this.components.scrollBarWrapper.clientHeight,
                scrollBarHeight = parseInt( scrollBarWrapperHeight * ( windowHeight / documentHeight ) ),
                Sd = Number( ( scrollBarWrapperHeight / documentHeight ).toFixed( 2 ) );

            this.description = {
                sd: Sd,
                winHeight: windowHeight,
                docHeight: documentHeight,
                scrollBarWrapperHeight: scrollBarWrapperHeight,
                scrollBarHeight: Sd >= 1 ? 0 : scrollBarHeight
            };

            var components = this.components;
            if( Sd >= 1 ) {
                components.scrollBar.style.height = 0;
                this.options.scrollMaxY = 0;
                this.options.newY = 0;

                components.scrollBar.style.transform = "translateY(0px)";
                components.scrollArea.style.transform = "translateY(0px)";

            } else {
                if( this.options.fadeScrollBar ) components.scrollBarWrapper.style.opacity = 0;
                else components.scrollBarWrapper.style.opacity = 1;

                components.scrollBar.style.height = scrollBarHeight + "px";
                this.options.scrollMaxY = windowHeight - documentHeight;
            }
        },
        on: function( event, fn ) {
            eventUtil.add( event, fn.bind( this ) );
        }
    };
    
    if( typeof define == "function" && define.amd ) return define( function() { return MyScroll } );
    else ( this || window ).MyScroll = MyScroll;
})( window, document, Math );