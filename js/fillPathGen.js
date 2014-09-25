
(function( pathGenerator, $, undefined ) { 

    //private properties
    var grid_colors = ['transparent','blue', 'yellow','orange', 'red', '#980000', '#800000', 'black'];
    var grid_values = [];
    var visualize = false;
    var delay = 0;
    var myInterval;
    var laser_shot = {x: 0, y: 0, set: false};
    var single_shot_grid_values = [];
    var spread = 1;
    
    var distance_sqr = function(a, b) {
            return ( (b.x-a.x)*(b.x-a.x) + (b.y-a.y)*(b.y-a.y));
        }

        var clamp = function(num, min, max) {
            return num < min ? min : (num > max ? max : num);
        };

    var cooling_rate = 1;
    
    //public properties
    pathGenerator.grid_size = 10;
    pathGenerator.progress = 0;

    pathGenerator.generate = function(settings, callback){
        // var open_paths = [[{X:0,Y:-10},{X:0,Y:10},{X:1,Y:10},{X:1,Y:0}, {X:2,Y:0},{X:2,Y:10},{X:3,Y:10},{X:3,Y:0}, {X:4,Y:0},{X:4,Y:10}, {X:5,Y:10},{X:5,Y:0}, {X:6,Y:0},{X:6,Y:10}, {X:7,Y:10},{X:7,Y:0}, {X:8,Y:0},{X:8,Y:10}, {X:9,Y:10},{X:9,Y:0}, {X:10,Y:0},{X:10,Y:20}]];
        visualize = settings.animate;
        if (visualize) delay = 40;
        pathGenerator.laser_path = [];
        spread = settings.spread;
         grid_values = [];

        pathGenerator.grid_size = settings.grid_square_width;

        for(var i = 0; i < pathGenerator.grid_size; i++){
            single_shot_grid_values[i] = [];
             for(var j = 0; j < pathGenerator.grid_size; j++){
                 grid_values.push({x: j, y: i, heat: 0, shot: false});
                 single_shot_grid_values[i][j] = 0;
            }
        }

        draw_b();

        laser_shot = {x: 0, y: 0, set: false};

        cooling_rate = settings.cooling_rate;
        pathGenerator.progress = 0;
        
        myInterval = setInterval(
        function path_planning_step(){
            pathGenerator.progress++;
            //pathGenerator.laser_path.push({x: laser_shot.x, y:laser_shot.y});
            
            for (var i = 0; i < pathGenerator.grid_size; i++){
                for (var j = 0; j < pathGenerator.grid_size; j++){
                    if (i%2 == 0)
		                pathGenerator.laser_path.push({x: j, y: i});
	                else
                        pathGenerator.laser_path.push({x: pathGenerator.grid_size-j-1, y: i});
                }
            }
            
             if (pathGenerator.laser_path.length >= pathGenerator.grid_size*pathGenerator.grid_size) {
                    clearInterval(myInterval);
                    draw_b();
                    update_progress_bar(100); 
                    var path_distance = 0;
                    var final_path = [];
                    final_path[0] = [];
                    final_path[0][0] = {X: pathGenerator.laser_path[0].x, Y:pathGenerator.laser_path[0].y};
                    for (var p = 1; p < pathGenerator.laser_path.length; p++){
                        final_path[0][p] = {X: pathGenerator.laser_path[p].x, Y:pathGenerator.laser_path[p].y};
                        path_distance = path_distance + distance_sqr(pathGenerator.laser_path[p-1], pathGenerator.laser_path[p]);
                    }
                     console.log(path_distance);
                     laser_shot.set = true;
                     //slice_3D_model(final_path, pathGenerator.grid_size);
                    clearInterval(myInterval);
                    callback(final_path);
                }else{
                    update_progress_bar(Math.ceil(100*pathGenerator.progress/(pathGenerator.grid_size*pathGenerator.grid_size)));  
            }

            if(visualize)draw_b();
        }, delay);
    }
    
    function draw_b() {

        var d_canvas = document.getElementById("pathgenviewer");
        var d_context = d_canvas.getContext("2d");
        var window_width, window_height;
         // resize the canvas to fill browser window dynamically
        window.addEventListener('resize', resizeCanvas, false);

        function resizeCanvas() {
            window_width = window.innerWidth;
            window_height = window.innerHeight;
            d_canvas.width = window_width;
            d_canvas.height = window_height;
            drawStuff(); 
        }
        resizeCanvas();

        function drawStuff() {
            var spacing = ((window_width*0.5-200)/pathGenerator.grid_size);
            var grid_width = pathGenerator.grid_size*spacing;
            var grid_height = pathGenerator.grid_size*spacing;
            var grid_left = 100;
            var grid_top = (window_height - grid_height)/2-60;
            var counter = 0;

            for (var y = 0; y < pathGenerator.grid_size; y += 1) {
               for (var x = 0; x < pathGenerator.grid_size; x += 1) {
                  d_context.moveTo(x*spacing + grid_left + 0.5, grid_top);
                  d_context.lineTo(x*spacing + grid_left + 0.5, grid_height + grid_top + 1);
                  //draw_rect(x, y, spacing, counter, grid_left, grid_top);
                  counter++;
                }
              d_context.moveTo(grid_left, y*spacing+grid_top + 0.5);
              d_context.lineTo(grid_width + grid_left, y*spacing+grid_top + 0.5);
            }


            d_context.moveTo(grid_width+grid_left, grid_top);
            d_context.lineTo(grid_width+grid_left, grid_height + grid_top + 1);
            d_context.moveTo(grid_left, grid_top + grid_height);
            d_context.lineTo(grid_width+grid_left, grid_height + grid_top);

            d_context.strokeStyle = "#fff";
            d_context.stroke();
            d_context.beginPath();
            d_context.moveTo(0, 0);
            
            d_context.lineWidth = 2;
            d_context.strokeStyle = 'black';

            for (var i = 0; i < pathGenerator.laser_path.length; i++){
                d_context.lineTo(pathGenerator.laser_path[i].x*spacing + spacing/2 + grid_left, pathGenerator.laser_path[i].y*spacing + spacing/2 + grid_top);
              
            }
            d_context.stroke();
        }


        function draw_rect(x_index, y_index, dim, index, left_corner, top_corner){
            d_context.fillStyle = grid_colors[grid_values[y_index*pathGenerator.grid_size + x_index].heat];
            d_context.fillRect (x_index*dim + left_corner, y_index*dim + top_corner, dim, dim);
        }

    }

    var $bar = $('.progress-bar');

    function update_progress_bar(percentage){
        $bar.css('width', percentage+'%').attr('aria-valuenow', percentage);	
        $bar.text(percentage + "%");
    }


}( window.pathGenerator = window.pathGenerator || {}, jQuery ));
    