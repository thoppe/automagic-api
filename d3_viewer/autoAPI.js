var f_graph = "input_graph.json";

var width = 600,
height = 300,
r = 10,
fill = d3.scale.category20();

var y_delta_space = 50;

var svg = d3.select("#chart").append("svg")
    .attr("width", width)
    .attr("height", height);

// define arrow markers for graph links
svg.append('svg:defs').append('svg:marker')
    .attr('id', 'end-arrow')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 6)
    .attr('markerWidth', 5)
    .attr('markerHeight', 6)
    .attr('orient', 'auto')
  .append('svg:path')
    .attr('d', 'M0,-5L10,0L0,5')
    .attr('fill', '#444');

var force = d3.layout.force()
    .gravity(.05)
    .distance(100)
    .charge(-150)
    .linkStrength(.01)
    .size([width, height])
    .on('tick',tick);

var node = svg.selectAll(".node");
var path = {};

d3.json(f_graph, function(error, json) {
    
    title = document.getElementById("project_name");
    title.innerHTML = json.project_name;

    force
        .nodes(json.nodes)
        .links(json.links)
        .start();

    node = node.data(json.nodes)
        .enter().append("g")
        .attr("class", "node")
        .attr("selected",0)
        .attr("name",function(d) {return d.name;})
        .call(force.drag);

    c1 = "#1f77b4"
    node.append('circle')
        .attr("r", r - .75)
        .style("fill", function(d) { return c1; })

    node.append("text")
        .attr("dx", 12)
        .attr("dy", ".35em")
        .text(function(d) { return d.name });

    node.on("mouseover", highlight_node);
    node.on("mouseout",  unhighlight_node);
    node.on("click", select_node);

    console.log(json.links);

    path = svg.append("svg:g").selectAll("path")
        .data(force.links())
        .enter().append("svg:path")
        .attr("source", function(d) { return d.source.name; })
        .attr("target", function(d) { return d.target.name; })
        .attr("class", "link")
        .attr("marker-end", "url(#end-arrow)");
});

function select_node(d) {
    var obj = d3.select(this);
    var is_selected = obj.attr("selected");
    
    if(is_selected=="0") {
        obj.attr("selected",1)

        c1 = "#ff7f0e"
        obj.select("circle")
            .style("fill", c1);
    };

    if(is_selected=="1") {
        obj.attr("selected",0)

        c1 = "#1f77b4"
        obj.select("circle")
            .style("fill", c1);
    };



}



function highlight_node(d) {

    $("text").attr("class", "faded");

    var obj = d3.select(this);

    // The class is used to remove the additional text later
    var info = obj.append('text')
        .classed('info', true)
        .attr("text-anchor", "middle")
        .attr('x', -20)
        .attr('y', 35)
        .style("font-size", "30px")
        .text(d.name);

    info_box = document.getElementById("project_text");
    info_box.innerHTML = d.sample_text;
};

function unhighlight_node(d) {
    d3.select(this).select('text.info').remove();
    $("text").attr("class", "");
}

function tick(e) {

    var k = .5*e.alpha;
    node.attr("transform", function(d) { 
        dy = k*(d.y-((d.depth-0.5)*y_delta_space));
        d.y -= dy;
    });

    path.attr('d', function(d) {
        var deltaX = d.target.x - d.source.x,
        deltaY = d.target.y - d.source.y,
        dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY),
        normX = deltaX / dist,
        normY = deltaY / dist,
        sourcePadding = d.left ? 17 : 12,
        targetPadding = d.right ? 17 : 12,
        sourceX = d.source.x + (sourcePadding * normX),
        sourceY = d.source.y + (sourcePadding * normY),
        targetX = d.target.x - (targetPadding * normX),
        targetY = d.target.y - (targetPadding * normY);
        return 'M' + sourceX + ',' + sourceY + 'L' + targetX + ',' + targetY;
    });

/*
    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });
*/
    node.attr("transform", function(d) { 
        return "translate(" + d.x + "," + d.y + ")"; });

};

/***************************************************************/

function save_as_svg() {
    // get svg element.
    var svg = document.getElementById("chart");

    //get svg source.
    var serializer = new XMLSerializer();
    var source = serializer.serializeToString(svg);


    //add name spaces.
    if(!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)){
        source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    if(!source.match(/^<svg[^>]+"http\:\/\/www\.w3\.org\/1999\/xlink"/)){
        source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
    }

    //add xml declaration
    source = '<?xml version="1.0" standalone="no"?>\r\n' + source;


    //convert svg source to URI data scheme.
    var url = "data:image/svg+xml;charset=utf-8,"+encodeURIComponent(source);

    var dl = document.createElement('a');
    dl.setAttribute('href', url);
    dl.setAttribute('download', 'output_graph.svg');
    dl.click();

    console.log(source);

};
