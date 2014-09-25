(function(ThreeSlicer, $ , undefined ) { 
    ThreeSlicer.generate = function(mesh, layer_position){
        var layer_level = layer_position;
        var lineArr = [];
        for (var i = 0; i < mesh.geometry.faces.length; i++){

            if(( mesh.geometry.vertices[mesh.geometry.faces[i].a].z > layer_level) && (mesh.geometry.vertices[mesh.geometry.faces[i].b].z > layer_level)&& (mesh.geometry.vertices[mesh.geometry.faces[i].c].z > layer_level) ){
               //face does not intersect plane! 
             // console.log(" No intersection");
            }else{

                if(( mesh.geometry.vertices[mesh.geometry.faces[i].a].z < layer_level) && (mesh.geometry.vertices[mesh.geometry.faces[i].b].z < layer_level)&& (mesh.geometry.vertices[mesh.geometry.faces[i].c].z < layer_level) ){

                }else{
                    //polygon is intersecting layer plane
                    var up = [];
                    var down = [];

                    if (mesh.geometry.vertices[mesh.geometry.faces[i].a].z > layer_level){
                        up.push(mesh.geometry.vertices[mesh.geometry.faces[i].a]);
                    }else{
                        down.push(mesh.geometry.vertices[mesh.geometry.faces[i].a]);
                    }
                    if (mesh.geometry.vertices[mesh.geometry.faces[i].b].z > layer_level){
                        up.push(mesh.geometry.vertices[mesh.geometry.faces[i].b]);
                    }else{
                        down.push(mesh.geometry.vertices[mesh.geometry.faces[i].b]);
                    }
                    if (mesh.geometry.vertices[mesh.geometry.faces[i].c].z > layer_level){
                        up.push(mesh.geometry.vertices[mesh.geometry.faces[i].c]);
                    }else{
                        down.push(mesh.geometry.vertices[mesh.geometry.faces[i].c]);
                    }
                    if (down.length > 2) up.push(new THREE.Vector3( 0, 0, layer_level ));
                    if (up.length > 2) down.push(new THREE.Vector3( 0, 0, layer_level ));

                    var line_points = [];
                    if (up.length >= down.length){

                        for (var j = 0; j < up.length; j++){
                            var r1 = ((layer_level - down[0].z)/(up[j].z - down[0].z));
                            var cross_point = new THREE.Vector3();
                            cross_point.subVectors( up[j] ,down[0]);
                            cross_point.multiplyScalar(r1);
                            cross_point.add(down[0]);
                            line_points.push(cross_point);

                        }


                    }else{
                        //console.log(down)
                        for (var j = 0; j < down.length; j++){
                            var r1 = ((layer_level - up[0].z)/(down[j].z - up[0].z));
                            var cross_point = new THREE.Vector3();
                            cross_point.subVectors( down[j] ,up[0]);
                            cross_point.multiplyScalar(r1);
                            cross_point.add(up[0]);
                            line_points.push(cross_point);

                        }
                    }
                     if (compare_vectors(line_points[0], line_points[1], 6)){ console.log("point");
                                                                            }else{
                     var line = new THREE.Line3(line_points[0], line_points[1]);
                     lineArr.push(line);
                                                                            }



                } //end second if


                   // console.log(mesh.geometry.vertices[mesh.geometry.faces[i].b].z);
            }//end first if
        }//end for
        var sorted_path = [];
       var prev_length = 0;
        
        var condition = 0;
        while(condition < 1){
            if(lineArr.length > 0){
                 var line_indexes = [];

                console.log("wooooooo");
                console.log("LineARR");
                console.log(lineArr[0]);

                sorted_path.push(lineArr[0].start);
                sorted_path.push(lineArr[0].end);
                line_indexes.push(0);

                for (var j = 0; j < lineArr.length; j++){
                    for(var i = 0; i < lineArr.length; i++){     
                        if ((compare_vectors(lineArr[i].start, sorted_path[sorted_path.length - 1], 6)) && !(compare_vectors(lineArr[i].end, sorted_path[sorted_path.length - 2], 6))){
                            sorted_path.push(lineArr[i].end);
                            line_indexes.push(i);
                            break;
                        }else if ((compare_vectors(lineArr[i].end, sorted_path[sorted_path.length - 1], 6)) && !(compare_vectors(lineArr[i].start, sorted_path[sorted_path.length - 2], 6)) ){
                            sorted_path.push(lineArr[i].start);
                            line_indexes.push(i);
                            break;
                        }
                    }
                    console.log(line_indexes);
                    if(line_indexes.length == prev_length){
                        for(var k = 0; k < line_indexes.length; k++) lineArr.splice(line_indexes[k],1);
                        break;
                    }
                    prev_length = line_indexes.length;
                    if((line_indexes[line_indexes.length-1] == 0) && (line_indexes.length > 1)){
                        //console.log(line_indexes);
                        for(var k = 0; k < line_indexes.length; k++) lineArr.splice(line_indexes[k],1);
                        break;
                    }
                }
                   condition++;
            }
        }

        ThreeSlicer.renderSlice(sorted_path);
        return sorted_path;

    }

    function compare_vectors(a, b, tolerance){

        if((a.x.toFixed(tolerance) == b.x.toFixed(tolerance)) && (a.y.toFixed(tolerance) == b.y.toFixed(tolerance)) && (a.z.toFixed(tolerance) == b.z.toFixed(tolerance))){
            return true;
        }
        return false;

    } 

        
}( window.ThreeSlicer = window.ThreeSlicer || {}, jQuery ));

