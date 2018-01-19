SVIFT.vis.mosaic = (function (data, container) {

  // Module object
  var module = SVIFT.vis.base(data, container);
 
  module.d3config = {
    ease:d3.easeCubicInOut, 
    interpolate: d3.interpolate(0,data.data.data[0].data[0]),
  };

  //Grid Function taken from https://bl.ocks.org/cagrimmett/07f8c8daea00946b9e704e3efcbd5739/bd1f4c0c33d8af6f64535b7963b0da2e6499fc31
  module.gridSetupData = function(size) {

    var squareBorder = size * 0.1;
    size = size - squareBorder;

    var data = new Array();
    var xpos = 1; //starting xpos and ypos at 1 so the stroke will show when we make the grid below
    var ypos = 1;

    // iterate for rows 
    for (var row = 0; row < 10; row++) {
        data.push( new Array() );

        // iterate for cells/columns inside rows
        for (var column = 0; column < 10; column++) {
            data[row].push({
                x: xpos,
                y: ypos,
                width: size,
                height: size
            })
            // increment the x position. I.e. move it over by 50 (width variable)
            xpos += size + squareBorder;
        }
        // reset the x position after a row is complete
        xpos = 1;
        // increment the y position for the next row. Move it down 50 (height variable)
        ypos += size + squareBorder; 
    }
    return data;
  }

  module.setup = function () {

    //Grid
    var dummyData = module.gridSetupData(10);

    module.d3config.rowContainer =  module.g.append('g').attr("id","rowContainer");

    module.d3config.row = module.d3config.rowContainer
      .selectAll(".row")
      .data(dummyData) //Add some dummy data to create all the rect
      .enter().append("g")
      .attr("class", "row");

    module.d3config.column = module.d3config.row.selectAll(".square")
      .data(function(d) { return d; })
      .enter().append("rect")
      .attr("class","square")
      .style("fill", data.data.colors[0])
      .style("stroke", "#fff")

    //Mosaic Value Text
    module.d3config.mosaicValueText = module.g.append("text")
      .text(data.data.data[0].data[0] + "%")
      .attr("font-family", data.style.font)
      .attr("fill", data.style.color.main)
      .attr("text-anchor", "middle")

  };


  module.resize = function () {

    var windowWidth = module.container.node().offsetWidth - module.config.margin.left - module.config.margin.right;
    var windowHeight = module.container.node().offsetHeight - module.config.margin.top - module.config.margin.bottom;

    //Set up the text sizes
    module.d3config.mosaicValueText
      .attr("x", windowWidth / 2)
      .attr("font-size", "2.5em")

    //set up grid
    var allTextHeights = module.config.bottomTextHeight + module.config.topTextHeight + module.d3config.mosaicValueText.node().getBBox().height + 20;
    var maxSize = Math.min(windowWidth,(windowHeight-allTextHeights));
    var cellSize = maxSize / 10;
    var cellData = module.gridSetupData(cellSize);

    module.d3config.row
      .data(cellData)
      .enter();

    module.d3config.column
      .data(function(d) { return d; })
      .enter()

    module.d3config.column
      .attr("x", function(d) { return d.x; })
      .attr("y", function(d) { return d.y; })
      .attr("width", function(d) { return d.width; })
      .attr("height", function(d) { return d.height; })

    module.d3config.rowContainer
      .attr("transform","translate(" +((windowWidth - maxSize)/2)+ ","+(module.config.topTextHeight) +")")


    // y Position of "value text" at the end 
    var gridSize = module.d3config.rowContainer.node().getBBox().height;
    module.d3config.mosaicValueText
      .attr("y", (gridSize + module.config.topTextHeight+ module.config.margin.left + module.config.margin.right + 20));

  };

  module.drawBars = function(t){

    var interpolation = Math.round(module.d3config.interpolate(module.d3config.ease(t)));

    var rects = d3.selectAll("rect")
        .filter(function(d, i) { return i <= (interpolation - 1); })
        .style("fill", data.style.color.main)

    module.d3config.mosaicValueText
      .text(interpolation + "%")

  };

  module.timeline = {
    bars: {start:0, end:3000, func:module.drawBars}
  };

  return module;
 });

