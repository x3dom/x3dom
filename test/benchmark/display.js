var all_suites = [];
var table_names = ["fields.js", "math.js", "glMatrix.js", "mjs.js", "sylvester.js"]

var test_queue = [];

function init_test()
{
  var applet = document.createElement("applet");
  applet.code = "nano";
  applet.archive = "benchmark.js/nano.jar";
  applet.width = 10;
  applet.height = 10;
  document.body.insertBefore(applet, document.body.firstChild);
}

function formatNumber(number)
{
  number = String(number).split('.');
  return number[0].replace(/(?=(?:\d{3})+$)(?!\b)/g, ',') + (number[1] ? '.' + number[1] : '');
}

cycle = function(event, bench)
{
  var result = bench.result_out;
  
  var div_ops = document.createElement("div");
  
  div_ops.innerHTML  = formatNumber(bench.hz.toFixed());
  div_ops.title      = "+/- " + bench.stats.rme.toFixed(2) + "% ";
  div_ops.title     += "@ " + bench.stats.size.toFixed() + " runs";
  
  result.appendChild(div_ops);
  
  // +/- speed
  if(bench.id != 1)
  {
    var suite = all_suites[bench.suite_id].suite;
    var speedup = ((100 / bench.hz) *  suite[0].hz).toFixed(2);

    var div_diff = document.createElement("div");
    div_diff.innerHTML = speedup + "%";
    
    if(speedup < 90)
      div_diff.style.backgroundColor = "#C55";
    else if(speedup < 110)
      div_diff.style.backgroundColor = "#3CF";
    else
      div_diff.style.backgroundColor = "#5C5";
      
    div_diff.style.verticalAlign = "center";
    div_diff.style.padding = "2px";
    div_diff.style.width = "50px";
    div_diff.style.float = "right";
    
    result.appendChild(div_diff);
  }
}

complete = function()
{
  var delta = this.delta_out;
  
  test_queue.shift();
  
  if(test_queue[0])
    test_queue[0].suite.run(true);
}

setup_table = function()
{
  var table = document.getElementById("results");
  
  for(var suite_id=0; suite_id<all_suites.length; ++suite_id)
  {
    var name = all_suites[suite_id].name;
    var suite = all_suites[suite_id].suite;
    
    var tr = document.createElement("tr");
    tr.style.backgroundColor = "#FFF"
    
    // test
    var td_run = document.createElement("td");
    td_run.style.textAlign = "left";
    
    tr.appendChild(td_run);
    
    // tests
    var current_id = 0;
    for(var test_id=0; test_id<table_names.length; ++test_id)
    {
      var test = suite[current_id];

      var current_test = 0;
      if(test)
        current_test = test.id-1;

      // fill empty tests
      if(test_id != current_test)
      {
        var td_result = document.createElement("td");
        td_result.id = "result_" + suite_id + "_" + test_id;
        
        td_result.innerHTML = "unavailable";
        td_result.style.color = "#C55";
        tr.appendChild(td_result);
      }
        
      // add test
      else
      {
        var td_result = document.createElement("td");
        td_result.style.textAlign = "center";
        
        td_result.id = "result_" + suite_id + "_" + test_id;
        
        test.result_out = td_result;
        tr.appendChild(td_result);
        current_id++;
      }
    }
    
    // delta
    var td_delta = document.createElement("td");
    
    td_delta.id = "delta_" + suite_id;
    td_delta.innerHTML = "-";
    
    suite.delta_out = td_delta;
    
    tr.appendChild(td_delta);
    
    // button
    var button = document.createElement("input");
    button.type = "button";
    button.value = name;
    button.name = suite_id;

    button.addEventListener("click", function()
    {
      all_suites[this.name].suite.run(true);
    });
    
    td_run.appendChild(button);
    
    table.appendChild(tr);
  }
}
 
create_test = function(name, test)
{
  var suite = new Benchmark.Suite;
  
  var suite_id = all_suites.length;
  
  all_suites[suite_id] = {};
  all_suites[suite_id].name = name;
  all_suites[suite_id].suite = suite;
    
  suite.on('cycle', cycle);
  suite.on('complete', complete);
  
  for(var i=0; i<test.length; ++i)
  {
    if(typeof test[i] == "function")
    {
      var benchmark = new Benchmark(name, test[i], {"id" : i+1});
      
      benchmark.suite_id = suite_id;
      suite.push(benchmark);
    }
  }
};

function run_all()
{
  for(var i=0; i<all_suites.length; ++i)
    test_queue.push(all_suites[i]);
  
  if(test_queue[0])
    test_queue[0].suite.run(true);
}

function run_all_at_once()
{
  for(var i=0; i<all_suites.length; ++i)
    all_suites[i].suite.run(true);
}
