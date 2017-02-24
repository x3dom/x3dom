/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 *
 * Based on code originally provided by
 * Philip Taylor: http://philip.html5.org
 */

 /**
 * Class: x3dom.RequestManager
 */

x3dom.RequestManager = {};

/**
 *
 * @type {number}
 */
x3dom.RequestManager.requests = [];

/**
 *
 * @type {number}
 */
x3dom.RequestManager.maxParallelRequests = 40;

/**
 *
 * @type {number}
 */
x3dom.RequestManager.failedRequests = 0;

/**
 *
 * @type {number}
 */
x3dom.RequestManager.loadedRequests = 0;

/**
 *
 * @type {number}
 */
x3dom.RequestManager.totalRequests = 0;


/**
 *
 * @type {number}
 */
x3dom.RequestManager.activeRequests = [];

/**
 *
 * @type {number}
 */
x3dom.RequestManager.requestHeaders = [];

/**
 *
 * @type {number}
 */
x3dom.RequestManager.withCredentials = false;


x3dom.RequestManager.onSendRequest = function( counters ) {}; 
x3dom.RequestManager.onAbortAllRequests = function( counters ) {}; 


/**
 *
 * @param header
 * @param value
 */
x3dom.RequestManager.addRequestHeader = function( header, value )
{
    this.requestHeaders.push( { header: header, value : value } );
};

/**
 *
 * @private
 */
x3dom.RequestManager._sendRequest = function()
{       
    this.onSendRequest( this._getCounters() );

    //Check if we have reached the maximum parallel request limit
    if ( this.activeRequests.length > this.maxParallelRequests )
    {
        return;
    }

    //Get next available request
    var request = this.requests.pop();

    //Check if the request is valid
    if ( request )
    {
        this.activeRequests.push( request );

        //Send request
        request.send( null );

        //Trigger next request sending
        this._sendRequest();
    }
};

/**
 *
 */
x3dom.RequestManager._getCounters = function () 
{
    return {
        loaded: this.loadedRequests,
        active: this.activeRequests.length,
        failed: this.failedRequests,
        total: this.totalRequests,
    };
};

/**
 *
 * @param request
 */
x3dom.RequestManager.addRequest = function( request )
{
    //Return if request is not a valid XMLHttpRequest
    if ( !( request instanceof XMLHttpRequest ) )
    {
        return;
    }

    //Increment total request counter
    this.totalRequests++;

    //Set withCredentials property
    request.withCredentials = this.withCredentials;

    //Set available request headers
    for ( var i = 0; i < this.requestHeaders.length; i++ )
    {
        var header = this.requestHeaders[ i ].header;
        var value = this.requestHeaders[ i ].value;

        request.setRequestHeader( header, value );
    }

    //Listen for onLoad
    request.addEventListener( "load", this._onLoadHandler.bind( this ) );

    //Listen for onError
    request.addEventListener( "error", this._onErrorHandler.bind( this ) );

    //Push it to the list
    this.requests.push( request );

    //Send next available request
    this._sendRequest();
};

/**
 *
 */
x3dom.RequestManager.abortAllRequests = function()
{
    for ( var i = 0; i < this.activeRequests.length; i++ )
    {
        this.activeRequests[ i ].abort();
    }

    this.requests = [];
    this.activeRequests = [];
    this.failedRequests = 0;
    this.loadedRequests = 0;
    this.totalRequests = 0;

    this.onAbortAllRequests( this._getCounters() );
}

/**
 *
 */
x3dom.RequestManager._removeActiveRequest = function( request )
{
    var idx = this.activeRequests.indexOf( request );

    return this.activeRequests.splice( idx, 1 );
};

/**
 *
 * @param e
 * @private
 */
x3dom.RequestManager._onLoadHandler = function( e )
{
    //Decrement active request counter
    this._removeActiveRequest( e.target );

    //Increment loaded request counter
    this.loadedRequests++;

    //Send next available request
    this._sendRequest();
};

/**
 *
 * @param e
 * @private
 */
x3dom.RequestManager._onErrorHandler = function( e )
{
    //Decrement active request counter
    this._removeActiveRequest( e.target );

    //Increment loaded request counter
    this.failedRequests++;

    //Send next available request
    this._sendRequest();
};
