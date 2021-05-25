import * as THREE from "three";
import * as d3 from 'd3-geo'
import {
  OrbitControls
} from 'three/examples/jsm/controls/OrbitControls';


export default class ThreeMap {
  constructor(set, mapData) {
    this.set = set;
    this.mapData = mapData;
  }

  init() {
    this.scene = new THREE.Scene();
    this.setCamera({
      x: 100,
      y: 100,
      z: 100
    });

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);
  }

  /** 经纬度转三维坐标
   * @param1: {Array} lnglat[x, y]
   */
  lnglatToVertor3(lnglat) {
    if (!this.projection) {
      this.projection = d3.geoMercator().center([108.418692, 33.258937]).scale(80);
    }
    const [x, y] = lnglat;
    const [x, y] = projection([...lnglat]);
    return [x, y, z = 0];

  }

  drawMap(json) {
    // 处理数据
    this.vertor3json = [];
    this.geoJson.features.forEach(data => {
      const areas = data.geomerty.coordinates[0]; // 坐标多维数组
      const areasData = {
        ...data.properties,
        coordinates: []
      }
      areas.forEach(point => {
        this.lnglatToVertor3(point);
      })

      this.vertor3json.push(areasData)
    })
  }

  // 设置相机
  setCamera(position) {
    this.camera = new THREE.PerspectiveCamera(10, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.up.x = 0;
    this.camera.up.y = 0;
    this.camera.up.z = 1;

    const {
      x,
      y,
      z
    } = position;

    this.camera.position.set(x, y, z);
    this.camera.lookAt(0, 0, 0);
    this.scene.add(this.camera);
  }

  // 设置控制器
  setController() {
    this.controller = new OrbitControls();

  }

  // 设置灯光
  setLight() {
    const light = new THREE.AmbientLight(0x404040); // soft white light
    this.scene.add(light);
  }

  // 动画
  animate() {
    requestAnimationFrame(this.animate.bind(this));
    this.controller.update();
    this.renderer.render(this.scene, this.camera);
  }
}
