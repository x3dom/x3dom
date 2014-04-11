/**
 * Helper class that stores references to a DOM node and to some associated event listeners.
 * This is especially useful to remove event listeners that have been previously installed at a later point.
 * @constructor
 */
function NodeEventListenerSet(domNode)
{
    this._domNode   = domNode;
    this._listeners = {};
}

//----------------------------------------------------------------------------------------------------------------------

/**
 * Installs the listener for the given event name. If there is already a listener for the given kind, it is first removed.
 */
NodeEventListenerSet.prototype.setListener = function(eventName, listener)
{
    if (this._listeners[eventName])
    {
        this.removeListener(eventName);
    }

    this._domNode.addEventListener(eventName, listener);

    this._listeners[eventName] = listener;
};

//----------------------------------------------------------------------------------------------------------------------

/**
 * Removes the listener for the given event name, if any.
 */
NodeEventListenerSet.prototype.removeListener = function(eventName)
{
    if (this._listeners[eventName])
    {
        this._domNode.removeEventListener(eventName, this._listeners[eventName]);

        delete this._listeners[eventName];
    }
};
