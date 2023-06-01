import {
    Ion,
    Viewer,
    createWorldTerrain,
    createOsmBuildings,
    Cartesian3,
    Math,
    GoogleMaps,
    Transforms,
    Matrix4,
    Model, HeadingPitchRoll
} from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";
import "../src/css/main.css"

const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5MmNhZjFkMi1hZjljLTQ5ZTEtOGIxZi1iMTc2MGI0YTcwYzgiLCJpZCI6MTM5ODcxLCJpYXQiOjE2ODQ0ODE5NTB9.mnZxaWR_9ighSvgIKlUs63rrCmPChtDo80vf7xuUuYg';
Ion.defaultAccessToken = key;
const apiKey = 'AIzaSyDey2NY3Aq7IEjgeE4bjh0WDQRPZA3OcGA';
GoogleMaps.defaultApiKey = apiKey;


// create view
const viewer = new Viewer('cesiumContainer', {
   imageryProvider: false,
  terrainProvider: createWorldTerrain({
    requestWaterMask: true, // water effects
    requestVertexNormals: true,
    infoBox: false,
    selectionIndicator: false,
    shadows: true,
    shouldAnimate: true,
  })
});

// photorealistic buildings and terrain - not sure if it looks nice
// const tileset = viewer.scene.primitives.add(new Cesium3DTileset({
//    url: "https://tile.googleapis.com/v1/3dtiles/root.json?key=" + apiKey,
//    showCreditsOnScreen: false,
// }));

// Add Cesium OSM Buildings, a global 3D buildings layer.
viewer.scene.primitives.add(createOsmBuildings());

// set the initial camera
viewer.scene.camera.setView({
    destination: Cartesian3.fromDegrees(-74.019, 40.6912, 1000),
    orientation: {
        heading: Math.toRadians(10),
        pitch: Math.toRadians(-20),
    },
});

// add model
function createModel(url) {
    viewer.entities.removeAll();

    const position = Cartesian3.fromDegrees(
        -74.019,
        40.6912,
        1000
    );

    const heading = Math.toRadians(-90);
    const pitch = 0;
    const roll = 0;
    const hpr = new HeadingPitchRoll(heading, pitch, roll);
    const orientation = Transforms.headingPitchRollQuaternion(position, hpr);

    // plane
    const entity = viewer.entities.add({
        name: "Plane",
        position: position,
        orientation: orientation,
        model: {
            uri: url,
            minimumPixelSize: 128,
            maximumScale: 20000,
        },
    });
    viewer.trackedEntity = entity;
    return entity;
}

let entity = createModel("http://localhost:3000/images/Cesium_Air.glb");
let position = entity.position;

console.log(position)

let speed = 1.0;

document.addEventListener('keydown', function (event) {
    const step = 5;
    const movement = new Cartesian3();

    switch(event.keyCode) {
        case 37: // left arrow
            movement.x -= step;
            break;
        case 38: // up arrow
            movement.y -= step;
            break;
        case 39: // right arrow
            movement.x += step;
            break;
        case 40: // down arrow
            movement.y += step;
            break;
        case 32: // space bar
            movement.z += step;
            break;
        case 17: // ctrl
            movement.z -= step;
            break;
    }

     const currentTime = viewer.clock.currentTime; // Get the current time
     const currentPosition = position.getValue(currentTime, new Cartesian3());
     const newPosition = Cartesian3.add(currentPosition, movement, new Cartesian3());
     position._value = newPosition;

     entity.position = position;
     console.log(position)
});


/*
document.addEventListener('keydown', function (event) {
    const step = 1;
    switch(event.keyCode)
    {
        case 37: // left arrow
            console.log("LEFT");
            position = Matrix4.multiplyByTranslation(
                position,
                new Cartesian3(-step, 0, 0),
                new Matrix4()
            );
            break;
        case 38: // up arrow
            console.log("UP");
            // position = Matrix4.multiplyByTranslation(
            //     position,
            //     new Cartesian3(0, 0, -step),
            //     new Matrix4()
            // );

            position = new Cartesian3(position._value.x, position._value.y, position._value.z);

            break;
        case 39: // right arrow
            console.log("RIGHT");
            position = Matrix4.multiplyByTranslation(
                position,
                new Cartesian3(step, 0, 0),
                new Matrix4()
            );
            break;
        case 40: // down arrow
            console.log("DOWN");
            position = Matrix4.multiplyByTranslation(
                position,
                new Cartesian3(0, 0, step),
                new Matrix4()
            );
            break;
    }
    entity.position = position;
    console.log(position)
});
*/

