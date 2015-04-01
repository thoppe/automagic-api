var f_graph = "jeo.json";

var w = width  = 960,
    h = height = 500,
    r = 6,
    fill = d3.scale.category20();

// init D3 force layout
var force = d3.layout.force()
//    .nodes(nodes)
//    .links(links)
//    .size([width, height])
//    .linkDistance(30)
//    .charge(-120)
//    .on('tick', tick);


var force = d3.layout.force()
    .charge(-120)
    .linkDistance(30)
    .size([w, h]);


var svg = d3.select("body").append("svg:svg")
    .attr("width", w)
    .attr("height", h);


d3.json(f_graph, function(json) {
  var link = svg.selectAll("line")
      .data(json.links)
    .enter().append("svg:line");

  var node = svg.selectAll("circle")
      .data(json.nodes)
      .enter().append("svg:circle")
      .attr("r", r - .75)
      .style("fill", function(d) { return fill(d.group); })
      .style("stroke", function(d) { return d3.rgb(fill(d.group)).darker(); })
      .call(force.drag);

  node.append("text")
        .attr("x", 12)
        .attr("dy", ".35em")
        .text(function(d) { return "FOO!"; });


  force
      .nodes(json.nodes)
      .links(json.links)
      .on("tick", tick)
      .start();

  function tick(e) {

    // Push sources up and targets down to form a weak tree.
    var k = 6 * e.alpha;
    json.links.forEach(function(d, i) {
      d.source.y -= k;
      d.target.y += k;
    });

    node.attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });

    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });
  }
});
