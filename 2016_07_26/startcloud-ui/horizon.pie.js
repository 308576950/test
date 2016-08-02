if (horizon.d3_pie_chart_usage.init) horizon.d3_pie_chart_usage.init = function(){};
if (horizon.d3_pie_chart_distribution.init) horizon.d3_pie_chart_distribution.init = function(){};

var d3charts = $('.d3_quota_bar');
  $(document).ready(function() {
    if (!$('#content_body').length) return;

    var height = Math.max($('#content_body')[0].clientHeight, window.screen.availHeight);
    $('.sidebar').height(height);
    setTimeout(function() {
        var height = Math.max($('#content_body')[0].clientHeight, window.screen.availHeight);
        $('.sidebar').height(height);
    }, 1501);

    //initialize pie chart
    $.each(d3charts, function(index, node) {
        var pieNode = $(node).children('.d3_pie_chart_usage')[0];
        $(node).children('strong').hide();
        var text = $(node).children('strong').html().split('<br>');
        var label = text[0];
        var desc = text[1];
        desc = desc.replace(/<\/span>/g, '').replace(/<span>/g, '');
        // used = used.replace(/<\/span>/g, '').replace(/<span>/g, '');
        if (horizon.languageCode === 'zh-cn') {
            used = desc.split('中的')[0] + '中的';
            total = desc.split('中的')[1];
        } else if (horizon.languageCode == 'en') {
            used = desc.split('of')[0] + ' of';
            total = desc.split('of')[1];
        }
        var value = parseInt($(pieNode).data('used'), 10);

        if (value >= 70 && value < 90) {
            $(pieNode).addClass('pieWarning');
        }
        if (value >= 90) {
            $(pieNode).addClass('pieError');
        }

        var rp1 = radialProgress(pieNode)
            .label(label)
            // .onClick(onClick1)
            .diameter(180)
            .value(value)
            .used(used)
            .total(total)
            .render();
        });
  });

function radialProgress(parent) {
    var _data = null,
        _duration = 3000,
        _selection,
        _margin = {top:0, right:0, bottom:30, left:0},
        __width = 150,
        __height = 200,
        _diameter = 200,
        _label = "",
        _used = "",
        _total = "",
        _fontSize = 11;


    var _mouseClick;

    var _value= 0,
        _minValue = 0,
        _maxValue = 100;

    var  _currentArc= 0, _currentArc2= 0, _currentValue=0;

    var _arc = d3.svg.arc()
        .startAngle(0 * (Math.PI/180)); //just radians

    var _arc2 = d3.svg.arc()
        .startAngle(0 * (Math.PI/180))
        .endAngle(0); //just radians


    _selection=d3.select(parent);


    function component() {

        _selection.each(function (data) {

            // Select the svg element, if it exists.
            var svg = d3.select(this).selectAll("svg").data([data]);

            var enter = svg.enter().append("svg").attr("class","radial-svg").append("g");

            measure();

            svg.attr("width", __width)
                .attr("height", __height);


            var background = enter.append("g").attr("class","component")
                .attr("cursor","pointer")
                .on("click",onMouseClick);


            _arc.endAngle(360 * (Math.PI/180));

            background.append("rect")
                .attr("class","background")
                .attr("width", _width)
                .attr("height", _height);

            background.append("path")
                .attr("transform", "translate(" + _width/2 + "," + _width/2 + ")")
                .attr("d", _arc);

            background.append("text")
                .attr("class", "label")
                .attr("transform", "translate(" + _width/2 + "," + (_width + _fontSize) + ")")
                .style('font-size', '15px')
                .style('fill', '#626262')
                .text(_label);
           var g = svg.select("g")
                .attr("transform", "translate(" + _margin.left + "," + _margin.top + ")");


            _arc.endAngle(_currentArc);
            enter.append("g").attr("class", "arcs");
            var path = svg.select(".arcs").selectAll(".arc").data(data);
            path.enter().append("path")
                .attr("class","arc")
                .attr("transform", "translate(" + _width/2 + "," + _width/2 + ")")
                .attr("d", _arc);

            //Another path in case we exceed 100%
            var path2 = svg.select(".arcs").selectAll(".arc2").data(data);
            path2.enter().append("path")
                .attr("class","arc2")
                .attr("transform", "translate(" + _width/2 + "," + _width/2 + ")")
                .attr("d", _arc2);


            enter.append("g").attr("class", "labels");
            var label = svg.select(".labels").selectAll(".label").data(data);
            label.enter().append("text")
                .attr("class","label")
                .attr("y",_width/2 + _fontSize/3)
                .attr("x",_width/2)
                .attr("cursor","pointer")
                .attr("width",_width)
                .style('fill', '#707070')
                // .attr("x",(3*_fontSize/2))
                // .text(function (d) { return Math.round((_value-_minValue)/(_maxValue-_minValue)*100) + "%" })
                .text(function (d) { return _used;})
                // .text('gee')
                .style("font-size", 11 + "px");

            label.enter().append("text")
                .attr("class","label")
                .attr("y",_width/2 + _fontSize/3 + 15)
                .attr("x",_width/2)
                .attr("cursor","pointer")
                .attr("width",_width)
                .style('fill', '#707070')
                // .attr("x",(3*_fontSize/2))
                // .text(function (d) { return Math.round((_value-_minValue)/(_maxValue-_minValue)*100) + "%" })
                .text(function (d) { return _total;})
                // .text('gee')
                .style("font-size", 11 +"px");

            label.enter().append("text")
                .attr("class","label")
                .attr("y",_width/2 + _fontSize/3 -20)
                .attr("x",_width/2)
                .attr("cursor","pointer")
                .attr("width",_width)
                // .attr("x",(3*_fontSize/2))
                .text(function (d) { return 'kkkk'; })
                // .text('gee')
                .style("font-size", 23 + "pt")
                .style('fill', '#313131');

            path.exit().transition().duration(1500).attr("x",1000).remove();


            layout(svg);

            function layout(svg) {

                var ratio=(_value-_minValue)/(_maxValue-_minValue);
                var endAngle=Math.min(360*ratio,360);
                endAngle=endAngle * Math.PI/180;

                path.datum(endAngle);
                path.transition().duration(_duration)
                    .attrTween("d", arcTween);

                if (ratio > 1) {
                    path2.datum(Math.min(360*(ratio-1),360) * Math.PI/180);
                    path2.transition().delay(_duration).duration(_duration)
                        .attrTween("d", arcTween2);
                }

                // console.log(label);
                label.datum(Math.round(ratio*100));
                label.transition().duration(_duration)
                    .tween("text",labelTween);

            }

        });

        function onMouseClick(d) {
            if (typeof _mouseClick == "function") {
                _mouseClick.call();
            }
        }
    }

    function labelTween(a) {
        var i = d3.interpolate(_currentValue, a);
        _currentValue = i(0);

        return function(t) {
            _currentValue = i(t);
            this.textContent = Math.round(i(t)) + "%";
        };
    }

    function arcTween(a) {
        var i = d3.interpolate(_currentArc, a);

        return function(t) {
            _currentArc=i(t);
            return _arc.endAngle(i(t))();
        };
    }

    function arcTween2(a) {
        var i = d3.interpolate(_currentArc2, a);

        return function(t) {
            return _arc2.endAngle(i(t))();
        };
    }


    function measure() {
        _width=_diameter - _margin.right - _margin.left - _margin.top - _margin.bottom;
        _height=_width;
        _fontSize=_width*.2;
        _arc.outerRadius(_width/2);
        _arc.innerRadius(_width/2 * .85);
        _arc2.outerRadius(_width/2 * .85);
        _arc2.innerRadius(_width/2 * .85 - (_width/2 * .15));
    }


    component.render = function() {
        measure();
        component();
        return component;
    };

    component.value = function (_) {
        if (!arguments.length) return _value;
        _value = [_];
        _selection.datum([_value]);
        return component;
    };

    component.margin = function(_) {
        if (!arguments.length) return _margin;
        _margin = _;
        return component;
    };

    component.diameter = function(_) {
        if (!arguments.length) return _diameter;
        _diameter =  _;
        return component;
    };

    component.minValue = function(_) {
        if (!arguments.length) return _minValue;
        _minValue = _;
        return component;
    };

    component.maxValue = function(_) {
        if (!arguments.length) return _maxValue;
        _maxValue = _;
        return component;
    };

    component.label = function(_) {
        if (!arguments.length) return _label;
        _label = _;
        return component;
    };
    component.used = function(_) {
        if (!arguments.length) return _used;
        _used = _;
        return component;
    };
    component.total = function(_) {
        if (!arguments.length) return total;
        _total = _;
        return component;
    };

    component._duration = function(_) {
        if (!arguments.length) return _duration;
        _duration = _;
        return component;
    };

    component.onClick = function (_) {
        if (!arguments.length) return _mouseClick;
        _mouseClick=_;
        return component;
    };

    return component;

}