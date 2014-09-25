
(function( ThreeSlicer, $, undefined ) { 
    var raster_path_scale = 0.1; 
    
    ThreeSlicer.gcodestring = "Z0\r\n";

     
    ThreeSlicer.sweep_layer_gcode = "M04\r\nM03\r\nM05\r\nM04\r\nG4 P120\r\nG4 P120\r\nG4 P120\r\nG4 P120\r\nM05\r\n";
    
    ThreeSlicer.open_laser_gcode = "M04\r\nM05\r\n";
    
    ThreeSlicer.close_laser_gcode = "M05\r\nM04\r\n";
    
    ThreeSlicer.skin = function(path_array, layer_position, raster_paths, settings){
        raster_path_scale = settings.grid_scale;
        var part_paths = new ClipperLib.Paths();
        var part_path = new ClipperLib.Path();
        for (var i = 0; i < path_array.length; i++){
            part_path.push(new ClipperLib.IntPoint(path_array[i].x, path_array[i].y));
        }
        part_paths.push(part_path);
       //  skinner.gcodestring += ";Shell\r\n"
        generate_gcode_string_from_path(part_paths);
    //    skinner.gcodestring += ";Shell\r\n"
        //console.log("CLipped");
        //part_paths = ClipperLib.Clipper.CleanPolygons(part_paths, 0.1);
        var cpr = new ClipperLib.Clipper();

        //renderGcode(part_paths, 0xffffff, 70);
        console.log(settings.grid_square_width);
        clip_grid(settings.grid_square_width*raster_path_scale, part_paths);

        function clip_grid(grid_spacing, subj_paths){
            var bounds = ClipperLib.JS.BoundsOfPaths (subj_paths, 1);
            var grid_number_width = Math.ceil((bounds.right - bounds.left)/grid_spacing);
            var grid_number_height = Math.ceil((bounds.bottom - bounds.top)/grid_spacing);

            for (var j = 0; j < grid_number_height; j++) {
                for (var i = 0; i < grid_number_width; i++) {
                    var dx0 = (grid_spacing*i) + bounds.left;
                    var dx1 = dx0 + grid_spacing;
                    var dy0 = bounds.top + (grid_spacing*j);
                    var dy1 = dy0 + grid_spacing;
                    var grid_clip_paths = [[{X:dx0,Y:dy0},{X:dx1,Y:dy0},{X:dx1,Y:dy1},{X:dx0,Y:dy1}]];
                    //console.log("path:");
                    //console.log(grid_clip_paths);
                    clip_plane(subj_paths, grid_clip_paths);
                }

            }
            ThreeSlicer.gcodestring += ThreeSlicer.sweep_layer_gcode;
            //console.log(skinner.gcodestring);

        }


        function clip_plane(path_subj, path_clip) {



            cpr.Clear();
            var scale = 100;
            ClipperLib.JS.ScaleUpPaths(path_subj, scale);
            ClipperLib.JS.ScaleUpPaths(path_clip, scale);

            cpr.AddPaths(path_subj, ClipperLib.PolyType.ptSubject, true);
            cpr.AddPaths(path_clip, ClipperLib.PolyType.ptClip, true);
            //cpr.AddPaths(clip_paths2, ClipperLib.PolyType.ptClip, true);

            var solution_tree = new ClipperLib.PolyTree();

            var clipType = ClipperLib.ClipType.ctIntersection;

            var subject_fillType = ClipperLib.PolyFillType.pftNonZero;
            var clip_fillType = ClipperLib.PolyFillType.pftNonZero;

            var succeeded = cpr.Execute(clipType, solution_tree, subject_fillType, clip_fillType);

            //console.log(solution_paths);
            if (solution_tree.Total()){

                var polynode = solution_tree.GetFirst()
                //console.log(solution_tree.Total());

                var solution_paths = ClipperLib.Clipper.PolyTreeToPaths(polynode);
                //console.log(solution_paths);
                ClipperLib.JS.ScaleDownPaths(solution_paths, scale);
                //console.log(ClipperLib.Clipper.CleanPolygons(solution_paths, 1.1))
                //renderGcode(solution_paths, 0xE60000, layer_position);

               // while(polynode)
                //{
                  //  console.log("1");
                    //solution_paths = ClipperLib.Clipper.PolyTreeToPaths(polynode);
                    //ClipperLib.JS.ScaleDownPaths(solution_paths, scale);
                    //if (!polynode.IsHole())renderGcode(solution_paths, 0xE60000, 1);
                    //polynode = polynode.GetNext();
                //}
                ClipperLib.JS.ScaleDownPaths(path_subj, scale);
                ClipperLib.JS.ScaleDownPaths(path_clip, scale);
                
                ClipperLib.JS.ScaleDownPaths(raster_paths, 1/raster_path_scale);
                
                clip_open(raster_paths,solution_paths, path_clip);
                
                ClipperLib.JS.ScaleUpPaths(raster_paths, 1/raster_path_scale);
            } else {
                ClipperLib.JS.ScaleDownPaths(path_subj, scale);
                ClipperLib.JS.ScaleDownPaths(path_clip, scale);
            }
            
            cpr.Clear();

            //renderGcode(path_clip, 0xffffff, 0);

        }

        function clip_open(path_subj, path_clip, trans_path) {
            //console.loconsole.log("PATHS");
            //console.log(path_subj);
            var half_square = raster_path_scale*0.5;
            var dist = {x:trans_path[0][0].X -  (path_subj[0][0].X) +half_square, y:trans_path[0][0].Y -  (path_subj[0][0].Y)+half_square};
            //console.log(trans_path[0][1].X);
           // path_subj[0][0].X += path_subj[0][0].X - trans_path[0][1].X
            //console.log(path_subj[0][0].X - trans_path[0][1].X);
            for (var r = 0; r<path_subj[0].length; r++){
               //console.log(dist);
               path_subj[0][r].X +=  dist.x;
               path_subj[0][r].Y +=  dist.y;
            }
             //renderPath(path_subj);
            cpr.Clear();
            var scale = 100;
            ClipperLib.JS.ScaleUpPaths(path_subj, scale);
            ClipperLib.JS.ScaleUpPaths(path_clip, scale);

            cpr.AddPaths(path_subj, ClipperLib.PolyType.ptSubject, false);
            cpr.AddPaths(path_clip, ClipperLib.PolyType.ptClip, true);
            //cpr.AddPaths(clip_paths2, ClipperLib.PolyType.ptClip, true);

            var solution_tree = new ClipperLib.PolyTree();

            var clipType = ClipperLib.ClipType.ctIntersection;

            var subject_fillType = ClipperLib.PolyFillType.pftNonZero;
            var clip_fillType = ClipperLib.PolyFillType.pftNonZero;

            var succeeded = cpr.Execute(clipType, solution_tree, subject_fillType, clip_fillType);
            var solution_lines = ClipperLib.Clipper.PolyTreeToPaths(solution_tree);


            ClipperLib.JS.ScaleDownPaths(solution_lines, scale);
            //console.log("solution");
            if (solution_lines.length){
                generate_gcode_string_from_path(solution_lines);
                
            }

            ThreeSlicer.renderPath(solution_lines, layer_position);

            ClipperLib.JS.ScaleDownPaths(path_subj, scale);
            ClipperLib.JS.ScaleDownPaths(path_clip, scale);
            ThreeSlicer.renderPath(path_clip, layer_position);

            cpr.Clear();
        }
    }
    
    function generate_gcode_string_from_path(gcode_path){
        
        for (var o = 0; o < gcode_path[0].length; o++){   
            ThreeSlicer.gcodestring += "G01 X" + gcode_path[0][o].X.toFixed(2) + " Y" + gcode_path[0][o].Y.toFixed(2) + "\r\n";
            if (o == 0) ThreeSlicer.gcodestring += ThreeSlicer.open_laser_gcode;
        }
        ThreeSlicer.gcodestring += ThreeSlicer.close_laser_gcode;
    }
    
}( window.ThreeSlicer = window.ThreeSlicer || {}, jQuery ));