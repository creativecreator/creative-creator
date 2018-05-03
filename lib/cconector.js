/*!
  @copyright from jQuery HTML SVG connect v2.0.0
  license: MIT
  based on: https://gist.github.com/alojzije/11127839
  modified auth: https://github.com/Manoj-Roy
  Register by: http://imerit.net/
*/
var ext, timerId;
(function ($,   undefined) {
  //https://github.com/jquery-boilerplate/jquery-boilerplate
  "use strict";
  
  var pluginName = "CCconnect",
    defaults = {
      stroke: "gray",
      strokeWidth: 5,
      orientation: "auto",
      arrowHead:'#000',
      // Array of objects with properties "start" & "end" that
      // define the selectors of the elements to connect:
      // i.e., {start: "#purple", end: "#green"}.
      // Optional properties:
      //  "stroke": [color],
       // "strokeWidth": 1,
      //  "orientation": [horizontal|vertical|auto (default)]
      paths: []
    };

  function Plugin(element, options) {
    this.element = element;
    this.$element = $(this.element);
    this.settings = $.extend({}, defaults, options);
    this._defaults = defaults;
    this._name = pluginName;
    this.init();
    return this;
  }

  ext = $.extend(Plugin.prototype, {
    init: function () {
      this.$svg = $(document.createElementNS("http://www.w3.org/2000/svg", "svg"));
      // custom marker added
    var NS="http://www.w3.org/2000/svg"; 
    var arrowObj=document.createElementNS(NS,"path"); 
      $(arrowObj).attr( "id", "markerArrow");
      // $(arrowObj).attr( "markerWidth", "80");
      // $(arrowObj).attr( "markerHeight", "30");
      // $(arrowObj).attr( "cx","80" );
      // $(arrowObj).attr( "cy","30" );
      $(arrowObj).attr( "style","stroke: none; fill:"+this.settings.arrowHead );
      $(arrowObj).attr("d","M2,2 L2,11 L10,6 L2,2" );

    var circleObj=document.createElementNS(NS,"circle"); 
        $(circleObj).attr('cx', '2')
                    .attr('cy', '2')
                    .attr('r', '2')
                    .attr('title', 'blue')
                    .attr('fill', 'blue');      

    var defs = document.createElementNS(NS, 'defs');

    var markerObjCircle = document.createElementNS(NS,"marker");
        markerObjCircle.setAttributeNS(null, "id", "circ");
        // markerObjCircle.setAttributeNS(null, "viewBox", "0 0 10 10" );
        markerObjCircle.setAttributeNS(null, "refX", "2");
        markerObjCircle.setAttributeNS(null, "refY", "2");
        markerObjCircle.setAttributeNS(null, "markerWidth", "4" );
        markerObjCircle.setAttributeNS(null, "markerHeight", "5");
        // markerObjCircle.setAttributeNS(null, "markerUnits","strokeWidth");

    var circleObjS=document.createElementNS(NS,"circle"); 
        $(circleObjS).attr('cx', '2')
                    .attr('cy', '2')
                    .attr('r', '2')
                    .attr('fill', '#000000');      

    var defs = document.createElementNS(NS, 'defs');

    var markerObjCircleS = document.createElementNS(NS,"marker");
        markerObjCircleS.setAttributeNS(null, "id", "circG");
        // markerObjCircle.setAttributeNS(null, "viewBox", "0 0 10 10" );
        markerObjCircleS.setAttributeNS(null, "refX", "2");
        markerObjCircleS.setAttributeNS(null, "refY", "2");
        markerObjCircleS.setAttributeNS(null, "markerWidth", "4" );
        markerObjCircleS.setAttributeNS(null, "markerHeight", "5");

    var markerObj = document.createElementNS(NS,"marker");
        markerObj.setAttributeNS(null, "id", "triangle");
        markerObj.setAttributeNS(null, "viewBox", "0 0 10 10" );
        markerObj.setAttributeNS(null, "refX", "8.5");
        markerObj.setAttributeNS(null, "refY", "6");
        markerObj.setAttributeNS(null, "markerWidth", "4" );
        markerObj.setAttributeNS(null, "markerHeight", "5");
        markerObj.setAttributeNS(null, "markerUnits","strokeWidth");
        markerObj.setAttributeNS(null, "orient", "auto");
        // end -------------------------------------------------++++++++++
        var _this = this;

        addSvgInHere(_this, this.$element, this.$svg, defs, markerObjCircleS, circleObjS, markerObj, arrowObj);
        
      // Draw the paths, and store references to the loaded elements.
      this.loadedPaths = $.map(this.settings.paths, $.proxy(this.connectSetup, this));
      // setInterval(function(argument) {
        _this.loadedPaths;
      // },200)
      
      $(document).on("resize click drag load", this.throttle(this.reset, 200, this));   

      return  addSvgInHere(_this, this.$element, this.$svg, defs, markerObjCircleS, circleObjS, markerObj, arrowObj);
    },

    reset: function () {
      var parnt = $('.fb-right');
      this.$svg.attr("height", $(parnt).height()).attr("width", $(parnt).width());
      var self = this;
      // Recalculate paths.
      $.each(this.loadedPaths, function (i, pathRef) {
        
        self.connectElements(pathRef.path, pathRef.start, pathRef.end, pathRef.orientation);
      });
    },

    connectSetup: function (pathConfig) {
      var _this = this;
      if (pathConfig.hasOwnProperty("start") && pathConfig.hasOwnProperty("end")) {
        var $start = $(pathConfig.start), $end = $(pathConfig.end);
        // Start/end elements exist.
        if ($start.length && $end.length) {
          var $path = $(document.createElementNS("http://www.w3.org/2000/svg", "path"));
          // Custom/default path properties.
          var stroke = pathConfig.hasOwnProperty("stroke") ? pathConfig.stroke : this.settings.stroke;
          var strokeWidth = pathConfig.hasOwnProperty("strokeWidth") ? pathConfig.strokeWidth : this.settings.strokeWidth;
          $path.attr("fill", "none")
            .attr("stroke", stroke)
            .attr('class', 'path')
            // .attr("marker-end", "url(#circ)")
            .attr("marker-end", "url(#triangle)")
            .attr("marker-start", "url(#circG)")
            .attr('animation', ' .5s linear')
            .attr("stroke-width", strokeWidth)
            .attr('style', 'cursor:pointer')
            .attr('start', $start.selector)
            .attr('end', $end.selector);

          this.$svg.append($path);
          // Custom/default forced orientation of path.
          var orientation = pathConfig.hasOwnProperty("orientation") ? pathConfig.orientation : "auto";
            _this.connectElements($path, $start, $end, orientation);
          // Save for reference.
          return { "path": $path, "start": $start, "end": $end, "orientation": orientation };
        }
      }

      
      return null; // Ignore/invalid.
    },
    
    // Whether the path should originate from the top/bottom or the sides;
    // based on whichever is greater: the horizontal or vertical gap between the elements
    // (this depends on the user positioning the elements sensibly,
    // and not overlapping them).
    determineOrientation: function ($startElem, $endElem) {
      // If first element is lower than the second, swap.
      if ($startElem.offset().top > $endElem.offset().top) {
        var temp = $startElem;
        $startElem = $endElem;
        $endElem = temp;
      }
      var startBottom = $startElem.offset().top + $startElem.outerHeight();
      var endTop = $endElem.offset().top;
      var verticalGap = endTop - startBottom;
      // If first element is more left than the second, swap.
      if ($startElem.offset().left > $endElem.offset().left) {
        var temp2 = $startElem;
        $startElem = $endElem;
        $endElem = temp2;
      }
      var startRight = $startElem.offset().left + $startElem.outerWidth();
      var endLeft = $endElem.offset().left;
      var horizontalGap = endLeft - startRight;
      return horizontalGap > verticalGap ? "vertical" : "horizontal";
    },

    connectElements: function ($path, $startElem, $endElem, orientation) {
      var $this = this;
      // Orientation not set per path.
      if (orientation != "vertical" && orientation != "horizontal") {
        // Check if global orientation has been set.
        if (this.settings.orientation != "vertical" && this.settings.orientation != "horizontal") {
          // Automatically determine. 
          orientation = this.determineOrientation($startElem, $endElem);
        } else {
          orientation = this.settings.orientation; // User forced setting.
        }
      }
      var swap = false;
      if (orientation == "vertical") {
        // If first element is more left than the second.
        swap = $startElem.offset().left > $endElem.offset().left;
      } else { // Horizontal
        // If first element is lower than the second.
        swap = $startElem.offset().top > $endElem.offset().top;
      }
      if (swap) {
        // var temp = $startElem;
        // $startElem = $endElem;
        // $endElem = temp;
      }
      // Get (top, left) corner coordinates of the svg container. 
      var svgTop = this.$element.offset().top;
      var svgLeft = this.$element.offset().left;

      // Get (top, left) coordinates for the two elements.
      var startCoord = $startElem.offset();
      var endCoord = $endElem.offset();

      // Centre path above/below or left/right of element.
      var centreSX = 0.5, centreSY = 1,
        centreEX = 0.5, centreEY = 0;
      if (orientation == "vertical") {
          centreSX = 1;
          centreSY = 0.5;
          centreEX = 0;
          centreEY = 0.5;
      }
      // Calculate the path's start/end coordinates.
      // We want to align with the elements' mid point.
      var startX = startCoord.left + centreSX * $startElem.outerWidth() - svgLeft;
      var startY = startCoord.top + centreSY * $startElem.outerHeight() - svgTop;
      var endX = endCoord.left + centreEX * $endElem.outerWidth() - svgLeft;
      var endY = endCoord.top + centreEY * $endElem.outerHeight() - svgTop;

      var startWX = startCoord.left + centreEX * $startElem.outerWidth() - svgLeft;
      var startSY = startCoord.top + centreEY * $startElem.outerHeight() - svgTop;
      var endWX = endCoord.left + centreSX * $endElem.outerWidth() - svgLeft;
      var endSY = endCoord.top + centreSY * $endElem.outerHeight() - svgTop;
      // setInterval(function (argument) {
        $this.drawPath($path, startX, startY, endX, endY, orientation, endWX, startWX, startSY, endSY);
      // },500)
      
    },

    drawPath: function ($path, startX, startY, endX, endY, orientation, endWX, startWX, startSY, endSY) {
      var stroke = parseFloat($path.attr("stroke-width"));
      // Check if the svg is big enough to draw the path, if not, set height/width.
      if (this.$svg.attr("width") < (Math.max(startX, endX) + stroke)) this.$svg.attr("width", (Math.max(startX, endX) + stroke));
      if (this.$svg.attr("height") < (Math.max(startY, endY) + stroke)) this.$svg.attr("height", (Math.max(startY, endY) + stroke));

      var deltaX = (Math.max(startX, endX) - Math.min(startX, endX)) * 0.1;
      var deltaY = (Math.max(startY, endY) - Math.min(startY, endY)) * 0.1;
      // For further calculations whichever is the shortest distance.
      var delta = Math.min(deltaY, deltaX);
      // Set sweep-flag (counter/clockwise)
      var arc1 = 0; var arc2 = 1;

      if (orientation == "vertical") {
        var sigY = this.sign(endY - startY);
        // If start element is closer to the top edge,
        // draw the first arc counter-clockwise, and the second one clockwise.

        if (startY > endY && startX > endX) {
            //start node at right bottom
              $path.attr("d", "M" + startWX + " " + startY +
            " H" + (startWX - delta) +
            " A" + delta + " " + delta + " 0 0 " + 1 + " " + (startWX - 2 * delta) + " " + (startY + delta * sigY) +
            " V" + (endY - delta * sigY) +
            " A" + delta + " " + delta + " 0 0 " + 0 + " " + (startWX - 3 * delta) + " " + endSY +
            " H" + endWX);
        }

        else if (startY > endY && startX < endX) {
            //start node at left bottom
              $path.attr("d", "M" + startX + " " + startY +
            " H" + (startX + delta) +
            " A" + delta + " " + delta + " 0 0 " + 0 + " " + (startX + 2 * delta) + " " + (startY + delta * sigY) +
            " V" + (endY - delta * sigY) +
            " A" + delta + " " + delta + " 0 0 " + 1 + " " + (startX + 3 * delta) + " " + endSY +
            " H" + endX);

        }

        else if (startY < endY && startX > endX) {
            //start node at right top
            $path.attr("d", "M" + startWX + " " + startY +
            " H" + (startWX - delta) +
            " A" + delta + " " + delta + " 0 0 " + arc1 + " " + (startWX - 2 * delta) + " " + (startY + delta * sigY) +
            " V" + (endY - delta * sigY) +
            " A" + delta + " " + delta + " 0 0 " + arc2 + " " + (startWX - 3 * delta) + " " + endSY +
            " H" + endWX);
        }

        else if (startY < endY && startX < endX) {
          //start node at left top
            $path.attr("d", "M" + startX + " " + startY +
            " H" + (startX + delta) +
            " A" + delta + " " + delta + " 0 0 " + 1 + " " + (startX + 2 * delta) + " " + (startY + delta * sigY) +
            " V" + (endY - delta * sigY) +
            " A" + delta + " " + delta + " 0 0 " + 0 + " " + (startX + 3 * delta) + " " + endSY +
            " H" + endX);
        }


        
      } else {
        //Horizontal

        var sigX = this.sign(endX - startX);
        // If start element is closer to the left edge,
        // draw the first arc counter-clockwise, and the second one clockwise.

        if (startY > endY && startX > endX) {
            //start node at right bottom
              $path.attr("d", "M" + startWX + " " + startSY +
          " V" + (startSY - delta) +
          " A" + delta + " " + delta + " 0 0 " + 0 + " " + (startWX + delta * sigX) + " " + (startSY - 2 * delta) +
          " H" + (endX - delta * sigX) +
          " A" + delta + " " + delta + " 0 0 " + 1 + " " + endX + " " + (startSY - 3 * delta) +
          " V" + endSY);
        }

        else if (startY > endY && startX < endX) {
            //start node at left bottom
              $path.attr("d", "M" + startWX + " " + startSY +
          " V" + (startSY - delta) +
          " A" + delta + " " + delta + " 0 0 " + 1 + " " + (startWX + delta * sigX) + " " + (startSY - 2 * delta) +
          " H" + (endX - delta * sigX) +
          " A" + delta + " " + delta + " 0 0 " + 0 + " " + endX + " " + (startSY - 3 * delta) +
          " V" + endSY);

        }

        else if (startY < endY && startX > endX) {
            //start node at right top
            $path.attr("d", "M" + startX + " " + startY +
          " V" + (startY + delta) +
          " A" + delta + " " + delta + " 0 0 " + 1 + " " + (startX + delta * sigX) + " " + (startY + 2 * delta) +
          " H" + (endX - delta * sigX) +
          " A" + delta + " " + delta + " 0 0 " + 0 + " " + endX + " " + (startY + 3 * delta) +
          " V" + endY);
        }

        else if (startY < endY && startX < endX) {
          //start node at left top
            $path.attr("d", "M" + startX + " " + startY +
          " V" + (startY + delta) +
          " A" + delta + " " + delta + " 0 0 " + 0 + " " + (startX + delta * sigX) + " " + (startY + 2 * delta) +
          " H" + (endX - delta * sigX) +
          " A" + delta + " " + delta + " 0 0 " + 1   + " " + endX + " " + (startY + 3 * delta) +
          " V" + endY);
        }

      }
      
    },
    
    // Chrome Math.sign() support.
    sign: function (x) {
      return x > 0 ? 1 : x < 0 ? -1 : x;
    },
    
    // https://remysharp.com/2010/07/21/throttling-function-calls
    throttle: function (fn, threshhold, scope) {
      threshhold || (threshhold = 250);
      var last, deferTimer;
      return function () {
        var context = scope || this;
        var now = +new Date,
          args = arguments;
        if (last && now < last + threshhold) {
          clearTimeout(deferTimer);
          deferTimer = setTimeout(function () {
            last = now;
            fn.apply(context, args);
          }, threshhold);
        } else {
          last = now;
          fn.apply(context, args);
        }
      };
    }
  });

  // A really lightweight plugin wrapper around the constructor,
  // preventing against multiple instantiations
  $.fn[pluginName] = function (options) {
   var  _this = this;
    return this.each(function () {

      if (!$.data(this, "plugin_" + pluginName)) {
          $.data(_this, "plugin_" + pluginName, new Plugin(_this, options));   

      }
    });
  };
  
    window.ns = ext;
   

})(jQuery);
// var timerId;
addSvgInHere = function(_this, $element, $svg, defs, markerObjCircleS, circleObjS, markerObj, arrowObj) {
  // timerId = setInterval(function(argument) {
    // $('svg').remove()
    $element.append($svg);
    $(defs).appendTo($svg);   
              // },500);
    setInterval(function (argument) {
                markerObjCircleS.appendChild(circleObjS);
                markerObj.appendChild(arrowObj);
                // $(defs).append(markerObjCircleS);
                $(defs).append(markerObj);         
    },500)
}

