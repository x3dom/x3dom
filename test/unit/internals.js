module("Internals");

test("presence of x3dom.canvases[]", function() {
    ok(x3dom.canvases instanceof Array, "x3dom.canvases[] present.")
});