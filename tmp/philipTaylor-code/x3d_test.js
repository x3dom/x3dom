function run_x3d_tests() {
    function assert(expr, msg) {
        if (! expr)
            throw new Error("assert failed '" + msg + "' in " + assert.caller);
    }
    var tests = {
        isa: function () {
            var groupingNode = new X3DGroupingNode();
            assert(isa(groupingNode, X3DGroupingNode), 'isa X3DGroupingNode');
            assert(isa(groupingNode, X3DChildNode), 'isa X3DChildNode');
            assert(isa(groupingNode, X3DNode), 'isa X3DNode');
            assert(! isa(groupingNode, X3DViewpointNode), 'isa X3DViewpointNode');
        },
    };

    var output = [];
    var allOk = true;
    for (var t in tests) {
        var ok = true;
        try { tests[t]() }
        catch (e) {
            ok = false;
            output.push(e);
        }
        if (ok)
            output.push('Test ok');
        else
            allOk = false;
    }
//    if (! allOk)
        log(output.join('\n'));
};

run_x3d_tests();
