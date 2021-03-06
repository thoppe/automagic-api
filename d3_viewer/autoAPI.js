var f_graph = "input_graph.json";

// size of the diagram
var width = $(document).width();
var height = 0.5*$(document).height();

var radius = 10;
var fill = d3.scale.category20();

var y_delta_space = 50;
var charge = 250;

var c1 = "#1f77b4";
var c2 = "#ff7f0e";
var c2 = "#EEB4B4";

var svg = d3.select("#chart").append("svg")
    .attr("width", width)
    .attr("height", height)
    .call(d3.behavior.zoom().on("zoom", redraw))
    .on("dblclick.zoom", null);


var vis = svg
    .append('svg:g');

// define arrow markers for graph links
vis.append('svg:defs').append('svg:marker')
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
    .charge(-charge)
    .linkStrength(.01)
    .size([width, height])
    .on('tick',tick);

var node = vis.selectAll(".node");
var path = {};

var userList;

d3.json(f_graph, function(error, json) {
    
    $("#project_name").text( json.project_name );

    // Load the text into search_box
    var box = $("#search_box .list");

    $(json.nodes).each(function() {
        name = this.name;
        text = this.sample_text;
        html = ("<li><h3 class='search_name'>"+name+"</h3>"+
                "<p class='search_text'>"+text+"</p></li>");
        obj = $(html).on("click", select_search_text);
        box.append(obj);
    });

    var options = {
        valueNames: [ 'search_name', 'search_text' ]
    };
    userList = new List('search_box', options);


    force
        .nodes(json.nodes)
        .links(json.links)
        .start();

    node = node.data(json.nodes)
        .enter().append("g")
        .attr("class", "node")
        .attr("selected",0)
        .attr("id",function(d){return "node_"+d.name})
        .attr("name",function(d) {return d.name;})
        .call(force.drag);

    node.append('circle')
        .attr("r", radius)
        .style("fill", function(d) { return c1; })

    node.append("text")
        .attr("dx", 12)
        .attr("dy", ".35em")
        .text(function(d) { return d.name });

    node.on("mouseover", highlight_node);
    node.on("mouseout",  unhighlight_node);
    node.on("click", select_node);
    node.on("dblclick",delete_node);

    path = vis.append("svg:g").selectAll("path")
        .data(force.links())
        .enter().append("svg:path")
        .attr("i", function(d) { return d.source.index; })
        .attr("j", function(d) { return d.target.index; })
        .attr("source", function(d) { return d.source.name; })
        .attr("target", function(d) { return d.target.name; })
        .attr("class", "link")
        .attr("marker-end", "url(#end-arrow)");
});

function select_node(d) {
    var obj = d3.select(this);
    highlight_toggle(obj);

    name = $(this).attr("name");
    $(".search_name").each(function() {
        if( $(this).text() == name ) {
            $(this).parent().toggleClass("search_selected");            
            console.log($(this).text());
        }
    });

}

function highlight_toggle(obj) {
    var is_selected = obj.attr("selected");   

    if(is_selected=="0") {
        obj.attr("selected",1)

        obj.select("circle")
            .style("fill", c2)
            .style("stroke-width",3) 
            .style("stroke","black") ;
    };

    if(is_selected=="1") {
        obj.attr("selected",0)

        obj.select("circle")
            .style("fill", c1)
            .style("stroke-width",0);
        
    };
}

function delete_node(d) {
    var x = d.index;

    $(".link").each(function() { 
        var i = this.getAttribute("i");
        var j = this.getAttribute("j");
        if(i==x || j==x) {
            edge = d3.select(this);
            edge.remove();
        }
    } );

    var obj = d3.select(this);
    obj.remove();
    force.start();
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

    //$("#project_text").html(d.sample_text);
    $("#search_button").val(d.name);
    userList.search(d.name);
    
    userList.filter(function(item) {
        item_name = item.values().search_name;
        return (item_name == d.name);
    }); 
    userList.filter();
    


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

/* +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */

function redraw() {
    vis.attr("transform",
             "translate(" + d3.event.translate + ")"
             + " scale(" + d3.event.scale + ")");
    userList.search();    
}

function select_search_text() {
    name = $(".search_name", this).text();
    highlight_toggle(d3.select("#node_"+name));

    $(this).toggleClass("search_selected");
}

