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

    module.d3config.rowContainer = module.vizContainer.append("g");

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
    module.d3config.mosaicValueText = module.vizContainer.append("text")
      .text(data.data.data[0].data[0] + "%")
      .attr("font-family", data.style.font)
      .attr('class', 'visFill labelText big')
      .attr("text-anchor", "middle")

  };


  module.resize = function () {

    var padding = 12;
    var windowWidth = module.vizSize.width -padding;
    var windowHeight = module.vizSize.height -padding;
    var maxSize = Math.min(windowWidth,windowHeight);

    //Set up the text sizes
    module.d3config.mosaicValueText
      .attr("font-size", "2.5em")
      .attr("dominant-baseline","hanging")

    var textHeight = module.d3config.mosaicValueText.node().getBBox().height;
    var maxSizeCells = maxSize - textHeight;

    module.d3config.mosaicValueText
      .attr("x", windowWidth/2)

    var cellSize = maxSizeCells / 10;
    var cellData = module.gridSetupData(cellSize);

    module.d3config.rowContainer 
      .attr("transform", "translate(" + ((windowWidth - maxSizeCells)/2) + "," + 15 + ")");

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

    // y Position of "value text" at the end 
    var gridSize = module.d3config.rowContainer.node().getBBox().height;
    module.d3config.mosaicValueText
      .attr("y", (gridSize  + (textHeight / 2)));

      console.log(module.d3config.column.selectAll('rect')._parents)

  };

  module.drawBars = function(t){

    var interpolation = Math.round(module.d3config.interpolate(module.d3config.ease(t)));

    module.d3config.column.selectAll('rect')._parents
      .forEach(function (key,i) {
        if(i <= (interpolation - 1)){
          d3.select(key).attr('class', 'visFill')
        }
      })


        // .each(function({}))
        // .filter(function(d, i) { return i <= (interpolation - 1); })
        // .attr('class', 'visFill');

    module.d3config.mosaicValueText
      .text(interpolation + "%")

  };

  module.timeline = {
    bars: {start:0, end:3000, func:module.drawBars}
  };

  return module;
 });

