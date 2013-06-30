var CONTESTANTS = ["leah", "matt", "andrea", "mike"];
var EVENTS      = ["blind", "battle", "knockout", "quarter",
                   "semi", "semi_team",
                   "final", "final_mentor", "final_repeat" ];

var CONTESTANT_NAMES = { leah: "Leah McFall"
                       , matt: "Matt Henry"
                       , andrea: "Andrea Begley"
                       , mike: "Mike Ward"
                       };

function calculateSummary(data) {
  var maxViews = 0;

  data.forEach(function(obj) {
    maxViews = Math.max(obj.views, maxViews);
  });

  return { maxViews : maxViews
         , left_pad : 100
         , width : 1024
         , height : 400
         , name_box : 200
         };
}

function extractContestantData(contestant, data) {
  var out = {};

  data.forEach(function(obj) {
    if (obj.key == contestant) {
      out[obj.event_key] = obj;
    }
  });

  return out;
}

function drawContestant(summary, paper, contestant_data, contestant) {

  var xscale = summary.width / EVENTS.length;
  var xoff = xscale / 2;

  var yscale = (summary.height - summary.name_box) / summary.maxViews;

  console.log(summary);
  var idx = 0;

  EVENTS.forEach(function(evt, idx) {
    var obj = contestant_data[evt];
    if (!obj) { return; }

    var bar_c_x = summary.base_x + idx * xscale + xoff;

    var bar = paper.rect( bar_c_x - 6,
                          summary.height - summary.name_box - obj.views * yscale,
                          12,
                          obj.views * yscale);
    bar.attr({fill: "#ccf", stroke: false });

    var song = paper.text(0,0, obj.song);
    var b = song.getBBox();
    song.attr({  x:    bar_c_x,
                 y:    summary.height - summary.name_box - (b.width / 2),
                 fill: "#777",
                 href: obj.link
              });
    song.rotate(-90);

  });

  var name = paper.text( summary.base_x + summary.width / 2
                       , summary.height - summary.name_box + 14
                       , CONTESTANT_NAMES[contestant]);
  name.attr("font-size", "20px");

  var photo = paper.image(contestant + ".jpg",
                          summary.base_x + summary.width / 2 - 112,
                          summary.height - summary.name_box + 30, 224, 126);
}

function drawLeftAxis(paper, summary, data) {
  var axis = paper.rect(summary.left_pad / 2, 0,
                        1, summary.height - summary.name_box);
  axis.attr({ stroke: false, fill: "#000" });

  var size_label = paper.text(0, 0, summary.maxViews);
  var b = size_label.getBBox();
  size_label.attr({ x: b.width / 2
                  , y: b.height / 2
                  , fill: '#f00'
                  });

  var yscale = (summary.height - summary.name_box) / summary.maxViews;
  var tick_width = 5

  data.forEach(function(obj) {

    var tick = paper.rect(summary.left_pad / 2 - tick_width,
                          summary.height - summary.name_box - obj.views * yscale,
                          tick_width, 1);
    tick.attr( { stroke: false, fill: "#000" });

  });

  var tick = paper.rect(summary.left_pad / 2 - tick_width,
                        0,
                        tick_width, 1);
  tick.attr( { stroke: false, fill: "#f00" });

}

function draw(element, data) {
  var summary = calculateSummary(data);
  var paper = Raphael(element, summary.width, summary.height);


  CONTESTANTS.forEach(function(contestant, idx) {
    var c_data = extractContestantData(contestant, data);

    var c_summary = { maxViews: summary.maxViews
                    , base_x:   summary.left_pad +
                                idx * ((summary.width - summary.left_pad + 50) /
                                  CONTESTANTS.length)
                    , base_y:   0
                    , width:    (summary.width - summary.left_pad) / CONTESTANTS.length - 50
                    , height:   summary.height
                    , name_box: summary.name_box
                    }

    drawContestant(c_summary, paper, c_data, contestant);

    drawLeftAxis(paper, summary, data);
  });

}


var voiceModule = angular.module('voice', []);


voiceModule.directive('chart', function() {
  return function(scope, element, attrs) {
    var redraw = function(newdata) {
      if(newdata) {
        draw(element[0], newdata);
      }
    }

    scope.$watch('data', redraw);
  };
});

function VoiceCtrl($scope, $http) {
  var self = this;

  self.setup = function(data) {
    console.log('got data');
    console.log(data);
    $scope.data = data;
  };

  $http.get('summary.json').success(self.setup);
}
