import './index.less';
import ThreeMapLightBar from './ThreeMapLightBar';
import {
  decodeGeo
} from "./utils"

// 打包的时候，此代码不载入
if (process.env.NODE_ENV === 'development') {
  import('./index.html');
}

$(function () {
  $.get("./assets/map/china.json", data => {
    const map = new ThreeMapLightBar({}, decodeGeo(data));
    map.init();

    
    // map.drawLightBar();
    // map.drawFlyLine();
  });


});
console.log('ok~~~');
