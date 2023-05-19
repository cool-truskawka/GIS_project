import {
    Ion,
    Viewer,
    createWorldTerrain,
    createOsmBuildings,
    Cartesian3,
    Math,
    GoogleMaps,
    Transforms,
    Model
} from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";
import "../src/css/main.css"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5MmNhZjFkMi1hZjljLTQ5ZTEtOGIxZi1iMTc2MGI0YTcwYzgiLCJpZCI6MTM5ODcxLCJpYXQiOjE2ODQ0ODE5NTB9.mnZxaWR_9ighSvgIKlUs63rrCmPChtDo80vf7xuUuYg';
Ion.defaultAccessToken = key;
const apiKey = 'AIzaSyDey2NY3Aq7IEjgeE4bjh0WDQRPZA3OcGA';
GoogleMaps.defaultApiKey = apiKey;

// adding model not working :C
const loader = new GLTFLoader();
console.log(GLTFLoader);
loader.load('http://localhost:3000/dragon/source/Dragon.glb', (gltf) => {
    viewer.scene.add(gltf.scene);
});


// create view
const viewer = new Viewer('cesiumContainer', {
   imageryProvider: false,
  // baseLayerPicker: false,
  terrainProvider: createWorldTerrain({
    requestWaterMask: true, // water effects
    requestVertexNormals: true,
    infoBox: false,
    selectionIndicator: false,
    shadows: true,
    shouldAnimate: true,
  })
});

// photorealistic buildings and terrain - not sure if looks nice
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

const modelMatrix = Transforms.eastNorthUpToFixedFrame(Cartesian3.fromDegrees(-74.019, 40.6912, 1000));

 // const model = viewer.scene.primitives.add(Model.fromGltf({
 //     url: "./dragon/source/Dragon.glb",
 //     modelMatrix: modelMatrix
 // }));



