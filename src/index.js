import './index.less';
import ThreeMap from "./ThreeMap"
import {
  decodeGeo
} from "./utils"

// 打包的时候，此代码不载入
if (process.env.NODE_ENV === 'development') {
  import('./index.html');
}

$(function(){
    $.get("./assets/map/china.json", res => {
        const data = decodeGeo(res); // 解密geo json
        console.log(data);
    });

    const map = new ThreeMap();
    map.init();
})
console.log('ok~~~');
