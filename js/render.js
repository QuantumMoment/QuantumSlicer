//if ( ! Detector.webgl ) Detector.addGetWebGLMessage();
(function(ThreeSlicer, $ , undefined ) { 
			var container, stats;

			var camera, controls, scene, renderer, window_width, window_height;
            
            var layerArr = [];

			init();
			render();

			function animate() {

				requestAnimationFrame(animate);
				controls.update();

			}

			function init() {
                window_width = document.getElementById( 'container' ).clientWidth;
                window_height = document.getElementById( 'container' ).clientHeight;
				camera = new THREE.PerspectiveCamera( 60, window_width / window_height, 1, 1000 );
				camera.position.z = 30;

				controls = new THREE.OrbitControls( camera, document.getElementById( 'container' ) );
				controls.damping = 0.2;
				controls.addEventListener( 'change', render );

				scene = new THREE.Scene();
				scene.fog = new THREE.FogExp2( 0xcccccc, 0.002 );

				light = new THREE.AmbientLight( 0x222222 );
				scene.add( light );

				// renderer

				renderer = new THREE.WebGLRenderer( { antialias: true } );
				renderer.setClearColor( scene.fog.color, 1 );
				renderer.setSize( window_width, window_height );

				container = document.getElementById( 'container' );
				container.appendChild( renderer.domElement );

				//

				window.addEventListener( 'resize', onWindowResize, false );

				controls.addEventListener('change', render);
				animate();

			}

                 ThreeSlicer.generate_model_mesh = function(type){
                var material = new THREE.MeshBasicMaterial( { wireframe: true } );
     
                var model_geometry;
                switch(type) {
                    case 1:
                        model_geometry = new THREE.SphereGeometry( 3, 32, 32 );
                        break;
                    case 2:
                        model_geometry = new THREE.IcosahedronGeometry(3, 1);
                        break;
                    case 3:
                        model_geometry = new THREE.TetrahedronGeometry(3, 1);
                        break;
                    case 4:
                         model_geometry = new THREE.BoxGeometry(2.5, 2.5, 2.5, 5, 5, 5);
                         break;
                    case 5:
                         model_geometry = new THREE.TextGeometry("P2AM2", {size: 5, height:2.5});
                         break;
                    default:
                        model_geometry = new THREE.CylinderGeometry(2.5, 2.5, 2, 32)//CylinderGeometry(radiusTop, radiusBottom, height, radiusSegments, heightSegments, openEnded)
                        
                       
                }
    
                var model_mesh = new THREE.Mesh( model_geometry, material );
                model_mesh.position.set( 0, 0, 0 );
                model_mesh.rotation.set( 0.5*Math.PI, 0, 0 ); 
                model_mesh.geometry.mergeVertices();
                model_mesh.geometry.computeBoundingBox();
                model_mesh.updateMatrix(); 
                model_mesh.geometry.applyMatrix( model_mesh.matrix );
                model_mesh.matrix.identity();
                model_mesh.rotation.set( 0, 0, 0 );
                model_mesh.position.set( 0, 0, 0 );
                scene.add( model_mesh );
                
                return model_mesh;
                
            }

            ThreeSlicer.clear_scene = function(){
                var obj, i;
                for ( i = scene.children.length - 1; i >= 0 ; i -- ) {
                    obj = scene.children[ i ];
                    scene.remove(obj);
                } 
            }
            
             ThreeSlicer.renderSlice = function(points){
                var materiadel = new THREE.LineBasicMaterial({ color: 0xFF0000 });
                var layer_geometry = new THREE.Geometry();

                layer_geometry.vertices = points;

                var line = new THREE.Line( layer_geometry, materiadel );
                scene.add( line );
             }
             
            ThreeSlicer.renderGcode = function(inputArray, path_color, z){
                
               //console.log("REndering");
                var pathShape = new THREE.Shape();
                var geometry = new THREE.Geometry();
                
				for ( var i = 0; i < inputArray.length; i ++ ) {
                    var holePath = new THREE.Path();
                    for ( var j = 0; j < inputArray[i].length; j ++ ){
                        if (i == 0){
                            if (!j)  pathShape.moveTo(inputArray[i][j].X, inputArray[i][j].Y);
                            else pathShape.lineTo(  inputArray[i][j].X, inputArray[i][j].Y );
                        }else{
                            if (!j)  holePath.moveTo(inputArray[i][j].X* 1.00002, inputArray[i][j].Y);
                            else holePath.lineTo(  inputArray[i][j].X * 0.9999, inputArray[i][j].Y);
                        }                        
                    
                    }
                     if (i) {
                    //holePath.lineTo(  inputArray[i][0].X, inputArray[i][0].Y )
                    pathShape.holes.push(holePath);
                     }
                    
                     //pathShape.lineTo( inputArray[i][0].X, inputArray[i][0].Y );
				}
                
                //console.log(pathShape);
                
                var geometry = new THREE.ShapeGeometry( pathShape );

                var mesh = THREE.SceneUtils.createMultiMaterialObject( geometry, [ new THREE.MeshBasicMaterial ( { color: path_color } ), new THREE.MeshBasicMaterial( { color: 0xffffff, wireframe: true, transparent: true } ) ] );
                mesh.position.set( 0, 0, z );
                mesh.rotation.set( 0, 0, 0 );
                mesh.scale.set( 1, 1, 1 );
                scene.add( mesh );

            }

            ThreeSlicer.renderPath = function(input_path, z){
                //console.log("input");
                //console.log(input_path);
                var material = new THREE.LineBasicMaterial({
                    color: 0x0000ff,
                });

                for (var i = 0; i<input_path.length; i++){
                    var geometry = new THREE.Geometry();
                     for (var j = 0; j<input_path[i].length; j++){
                        geometry.vertices.push( new THREE.Vector3(input_path[i][j].X , input_path[i][j].Y, z ));
                     }
                    var line = new THREE.Line( geometry, material );
                    scene.add( line );
                }


            }


			function onWindowResize() {
                window_width = document.getElementById( 'container' ).clientWidth;
                window_height = document.getElementById( 'container' ).clientHeight;

				camera.aspect = window_width / window_height;
				camera.updateProjectionMatrix();

				renderer.setSize( window_width, window_height );

				render();

			}
    
            ThreeSlicer.render= function(){
                render();    
            }

			function render() {

				renderer.render( scene, camera );

			}
}( window.ThreeSlicer = window.ThreeSlicer || {}, jQuery ));
