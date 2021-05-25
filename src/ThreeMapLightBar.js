import ThreeMap from "./ThreeMap";
import * as THREE from "three";
import {
  throttle
} from "lodash";

const pic1 = require("./assets/images/lightray.jpg");
const pic2 = require("./assets/images/lightray_yellow.jpg");

export default class ThreeMapLightBar extends ThreeMap {
  constructor(options, data) {
    super(options, data);
    this.textures = [(new THREE.TextureLoader()).load(pic1), (new THREE.TextureLoader()).load(pic2)];
    this.colors = ["#FFF", "#FFEB3B"];
    this.lineCount = 20;
    this.colorIndex = 0;
  }

  // 添加底座
  addHexagon(position, i) {
    const geometry = new THREE.CircleGeometry(0.5, 6);
    const material = new THREE.MeshBasicMaterial({
      color: this.colors[i % 2]
    });
    const circle = new THREE.Mesh(geometry, material);
    const [x, y, z] = position;
    circle.position.set(x, y, z + 2 + 0.1);
    return circle;
  }

  // 绘制曲线
  drawFlyLine(data) {
    const group = new THREE.Group();
    data.forEach(item => {
      const {
        source,
        target
      } = item;
      const [x0, y0, z0] = this.vertor3object[source.name].vertor3; // 攻击源
      const [x1, y1, z1] = this.vertor3object[target.name].vertor3; // 攻击目标

      const curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(x0, y0, z0), // 起点
        new THREE.Vector3((x0 + x1) / 2, (y0 + y1) / 2, 10), // 控制点
        new THREE.Vector3(x1, y1, z1) // 终点
      );

      const points = curve.getPoints(20);
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({
        color: 0xff0000
      });
      const curveObject = new THREE.Line(geometry, material);
      group.push(curveObject);

      this.scene.add(group); // 加入场景中
    });
  }

  //   重写动画
  rewriteAnimate = throttle(() => {
    if (this.flyGroup) {
      this.flyGroup.forEach(mesh => {
        console.log(this.colorIndex);
        mesh.geometry.colors = new Array(this.lineCount).fill(1).map((item, index) => {
          if (index === this.colorIndex) {
            return new THREE.Color("#f0f");
          } else {
            return new THREE.Color("#fff");
          }
        })

        mesh.geometry.colorsNeedUpdate = true;
      });

      this.colorIndex++;
      if (colorIndex === this.lineCount) {
        this.colorIndex = 0;
      }
    }
  }, 100)

  // 绘制光柱（点）
  drawLightBar(data) {
    const group = new THREE.Group();
    data.forEach((item, index) => {
      const {
        cp
      } = this.vertor3object[item.name];
      const [x, y, z] = this.lnglatToVertor3(cp);
      this.vertor3object[item.name].vertor3 = [x, y, z];
      const geometry = new THREE.PlaneGeometry(item.value / 10);
      const material = new THREE.MeshBasicMaterial({
        map: this.textures[i % 2],
        transparent: true,
        depthTest: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide
      });
      const plane = new THREE.Mesh(geometry, material);
      plane.position.set(x, y, z + item.value / 10 / 2 + 2)
      plane.rotation.x = -Math.PI / 2;
      const plane2 = plane.clone();
      plane.rotation.y = Math.PI / 2;
      // 加入到组中
      group.add(plane);
      group.add(plane2);
      group.add(this.addHexagon([x, y, z], index));
    })

    this.scene.add(group);
  }

}
