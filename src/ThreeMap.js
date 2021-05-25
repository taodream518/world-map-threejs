import * as THREE from "three";
import * as d3 from 'd3-geo'
import {
  OrbitControls
} from 'three/examples/jsm/controls/OrbitControls';


export default class ThreeMap {
  constructor(options, data) {
    this.options = options;
    this.data = data;
  }

  // 初始化
  init() {
    this.scene = new THREE.Scene();
    // this.scene.background = new THREE.Color(0xEEF1FA); // 背景色
    this.renderer = new THREE.WebGLRenderer({
      antialias: true, // 抗锯齿开启
      //   alpha: true,
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    // 设置相机
    this.setCamera({
      x: 100,
      y: 0,
      z: 100
    });

    // 设置灯光
    this.setLight();

    // 设置控制器
    this.setController();

    // 绘制地图
    this.drawMap();

    // 添加事件
    this.addEvent();

    // 设置动画
    this.animate();

  }

  // 鼠标移入效果
  updateMouseMoveEffect() {
    // 通过摄像机和鼠标位置更新射线
    this.raycaster.setFromCamera(this.mouse, this.camera);

    // 计算物体和射线的焦点
    const intersects = this.raycaster.intersectObjects(this.areaGroup.children);
    // if (this.areaGroup?.children) {
    this.areaGroup.children.forEach(mesh => {
      mesh.material.color.set(0x005FC3);
    })
    // }
    for (let i = 0; i < intersects.length; i++) {
      intersects[i].object.material.color.set(0xFFEB3B);
    }
  }

  // 添加事件
  addEvent() {
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    const onMouseMove = event => {
      this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }
    window.addEventListener("mousemove", onMouseMove, false);
  }

  /** 经纬度转三维坐标
   * @param1: {Array} lnglat[x, y]
   */
  lnglatToVertor3(lnglat) {
    if (!this.projection) {
      this.projection = d3.geoMercator().center([108.418692, 33.258937]).scale(80).translate([0, 0]);
    }
    const [x, y] = this.projection([...lnglat]);
    const z = 0;
    return [y, x, z];
  }

  // 绘制地图
  drawMap(json) {
    // 处理数据
    this.vertor3json = [];
    this.data.features.forEach(data => {
      const areas = data.geometry.coordinates[0]; // 坐标多维数组
      const areasData = {
        ...data.properties,
        coordinates: []
      }
      areas.forEach((point, i) => {
        if (point[0] instanceof Array) {
          areasData.coordinates[i] = [];
          point.forEach(pointInner => {
            areasData.coordinates[i].push(this.lnglatToVertor3(pointInner))
          });
        } else {
          areasData.coordinates.push(this.lnglatToVertor3(point));
        }
        this.lnglatToVertor3(point);
      })

      this.vertor3json.push(areasData)
    })

    // 绘制模块
    const areaGroup = new THREE.Group(); // 存放区域组
    const lineGroup = new THREE.Group(); // 存放线条组

    this.vertor3json.forEach(areas => {
      // 多面
      if (areas.coordinates[0][0] instanceof Array) {
        areas.coordinates.forEach(area => {
          const mesh = this.getAreaMesh(area);
          areaGroup.add(mesh);
          const line = this.getAreaLine(area);
          lineGroup.add(line);
        });
      } else {
        // 单面
        const mesh = this.getAreaMesh(areas.coordinates);
        areaGroup.add(mesh);
        const line = this.getAreaLine(areas.coordinates);
        lineGroup.add(line);
      }
    });



    this.scene.add(areaGroup); // 添加形状到场景中
    this.scene.add(lineGroup); // 添加线条到场景中

    this.areaGroup = areaGroup; // 加入到全局变量

    // 添加底层线条
    // const lineGroup2 = lineGroup.clone();
    // lineGroup2.position.z = -2;
    // this.scene.add(lineGroup2);
  }

  // 生成区域线条
  getAreaLine(points) {
    const material = new THREE.LineBasicMaterial({
      color: 0xffffff // TODO 线条颜色
    });

    // 构造三维数组的点
    const vertor3Points = [...points].map(point => {
      const [x, y, z] = point;
      return new THREE.Vector3(x, y, z + 2) // z轴高于深度，线条才显示在上面
    });

    const geometry = new THREE.BufferGeometry().setFromPoints(vertor3Points);
    const line = new THREE.Line(geometry, material);
    return line;
  }

  // 生成绘制区域块 points = 
  getAreaMesh(points) {
    const shape = new THREE.Shape();
    points.forEach((point, i) => {
      const [x, y] = point;
      if (i === 0) {
        shape.moveTo(0, 0);
      } else if (i === points.length - 1) {
        shape.quadraticCurveTo(x, y, x, y);
      } else {
        shape.lineTo(x, y, x, y)
      }
      //   if (i === 0) {
      //     shape.moveTo(x, -y);
      //   }
      //   shape.lineTo(x, -y);
    })

    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: 2,
      bevelEnabled: false,
    });
    const material = new THREE.MeshBasicMaterial({
      color: 0x005FC3, // TODO 地图颜色
      transparent: true,
      opacity: 0.8
    });
    const mesh = new THREE.Mesh(geometry, material);
    return mesh;
  }

  // 设置相机
  setCamera(position) {
    this.camera = new THREE.PerspectiveCamera(10, window.innerWidth / window.innerHeight, 0.1, 1000);
    // this.camera = new THREE.OrthographicCamera(
    //   1000 / -2,
    //   1000 / 2,
    //   600 / 2,
    //   600 / -2,
    //   1,
    //   500);
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
    this.controller = new OrbitControls(
      this.camera,
      this.renderer.domElement
    );
  }

  // 设置灯光
  setLight() {
    const light = new THREE.AmbientLight(0x404040); // soft white light
    this.scene.add(light);
  }

  // 动画
  animate() {
    requestAnimationFrame(this.animate.bind(this));
    this.updateMouseMoveEffect();
    this.renderer.render(this.scene, this.camera);
    this.controller.update();
    if (this.rewriteAnimate) {
      this.rewriteAnimate();
    }
  }
}
