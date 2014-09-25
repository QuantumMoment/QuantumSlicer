(function( app, $, undefined ) { 
    
    function isNumber(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }
    
    var settings = {};
    
    var path_generated = [];
    
    $('#sliceButton').addClass('disabled');
    $('#dowanloadButton').addClass('disabled');

    app.generatePathForm = function(frm){
        if (frm.cr.value == "" || frm.spread.value == "" || frm.grid_size.value == "")
            alert("Hey! You didn't enter anything in one of the fields!")
        else if (!isNumber(frm.cr.value) || !isNumber(frm.spread.value) || !isNumber(frm.grid_size.value))
            alert("Hey! One of the fields is not a number!")
        else{
            settings = {animate: frm.animate.checked, cooling_rate: parseInt(frm.cr.value), spread:parseInt(frm.spread.value), grid_square_width: parseInt(frm.grid_size.value)};   
            generate();    
        }
    }
    
      app.generateSliceForm = function(frm){
        if (frm.layer_height.value == "" || frm.model_type.value == "" || frm.grid_scale.value == ""  )
            alert("Hey! You didn't enter anything in one of the fields!")
        else if (!isNumber(frm.layer_height.value) || !isNumber(frm.model_type.value) || !isNumber(frm.grid_scale.value) )
            alert("Hey! One of the fields is not a number!")
        else{
            settings.layer_height = parseFloat(frm.layer_height.value); 
            settings.model_type = parseInt(frm.model_type.value);  
            settings.grid_scale = parseFloat(frm.grid_scale.value);  
            slice();    
        }
    }
    
    var generate = function(){
        
        pathGenerator.generate(settings, function(fill_path_gen_path){
            
            path_generated = fill_path_gen_path;
            $('#sliceButton').removeClass('disabled');
        });
    }
    
    var slice = function(){
        ThreeSlicer.clear_scene(); 
        
        var layer_height = settings.layer_height;

        var sphere_mesh = ThreeSlicer.generate_model_mesh(settings.model_type);

        for (var l = sphere_mesh.geometry.boundingBox.min.z + layer_height ; l < sphere_mesh.geometry.boundingBox.max.z; l += layer_height){
            ThreeSlicer.skin(ThreeSlicer.generate(sphere_mesh, l), l, path_generated, settings);
        }
        ThreeSlicer.render();
        $('#dowanloadButton').removeClass('disabled');
    }
    
    app.download_gcode = function(){
        var a = document.getElementById("dowanloadButton");
        a.href = "data:text/plain;base64," + btoa(ThreeSlicer.gcodestring);
        a.setAttribute('download', 'export.gcode');    
    }


}( window.app = window.app || {}, jQuery ));