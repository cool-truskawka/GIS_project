import {
    Ion,
    Viewer,
    createWorldTerrain,
    createOsmBuildings,
    Cartesian3,
    Math,
    GoogleMaps,
    Transforms,
    Matrix3,
    Matrix4,
    Model, 
    HeadingPitchRoll,
    Quaternion 
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

    const heading = Math.toRadians(0);
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

let speed = 0.1; // Initial speed value
let rotationSpeed = 0.02; // Rotation speed value

viewer.clock.onTick.addEventListener(function (clock) {
    const acceleration = 0.01; // Speed increment value

    const orientation = entity.orientation.getValue(clock.currentTime, new HeadingPitchRoll());
    const forwardVector = new Cartesian3();
    const quaternion = Transforms.headingPitchRollQuaternion(position.getValue(clock.currentTime, new Cartesian3()), orientation);
    Matrix3.multiplyByVector(Matrix3.fromQuaternion(quaternion), Cartesian3.UNIT_X, forwardVector);
    Cartesian3.normalize(forwardVector, forwardVector);

    const movement = Cartesian3.multiplyByScalar(forwardVector, speed, new Cartesian3());

    const currentPosition = position.getValue(clock.currentTime, new Cartesian3());
    const newPosition = Cartesian3.add(currentPosition, movement, new Cartesian3());
    position._value = newPosition;

    entity.position = position;
    console.log(position);
});


viewer.clock.onTick.addEventListener(function (clock) {
    const acceleration = 0.01; // Speed increment value

    const orientation = entity.orientation.getValue(clock.currentTime, new HeadingPitchRoll());
    const forwardVector = new Cartesian3();
    const quaternion = Transforms.headingPitchRollQuaternion(position.getValue(clock.currentTime, new Cartesian3()), orientation);
    Matrix3.multiplyByVector(Matrix3.fromQuaternion(quaternion), Cartesian3.UNIT_X, forwardVector);
    Cartesian3.normalize(forwardVector, forwardVector);

    const movement = Cartesian3.multiplyByScalar(forwardVector, speed, new Cartesian3());

    const currentPosition = position.getValue(clock.currentTime, new Cartesian3());
    const newPosition = Cartesian3.add(currentPosition, movement, new Cartesian3());
    position._value = newPosition;

    entity.position = position;
    console.log(position);
});

document.addEventListener('keydown', function (event) {
    const acceleration = 0.01; // Speed increment value

    switch (event.keyCode) {
        case 38: // up arrow
            speed += acceleration;
            break;
        case 40: // down arrow
            speed -= acceleration;
            // Limit the speed to a minimum of 0.01
            speed = (speed > 0.01) ? speed : 0.01;
            break;
        case 37: // left arrow
            const rotationMatrix = Matrix3.fromRotationZ(rotationSpeed);
            const rotationQuaternion = Quaternion.fromRotationMatrix(rotationMatrix);
            const modelMatrix = entity.model.modelMatrix;
            const newModelMatrix = Matrix4.multiply(
                Matrix4.fromRotationTranslation(
                    rotationQuaternion,
                    Cartesian3.ZERO,
                    new Matrix4()
                ),
                modelMatrix,
                new Matrix4()
            );
            entity.model.modelMatrix = newModelMatrix;
            break;
        case 39: // right arrow
            const negativeRotationMatrix = Matrix3.fromRotationZ(-rotationSpeed);
            const negativeRotationQuaternion = Quaternion.fromRotationMatrix(negativeRotationMatrix);
            const modelMatrix2 = entity.model.modelMatrix;
            const newModelMatrix2 = Matrix4.multiply(
                Matrix4.fromRotationTranslation(
                    negativeRotationQuaternion,
                    Cartesian3.ZERO,
                    new Matrix4()
                ),
                modelMatrix2,
                new Matrix4()
            );
            entity.model.modelMatrix = newModelMatrix2;
            break;
    }
});
