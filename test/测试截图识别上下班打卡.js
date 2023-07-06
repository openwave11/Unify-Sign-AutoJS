let {config} = require('../config.js')(runtime, this)
let singletonRequire = require('../lib/SingletonRequirer.js')(runtime, this)
let WidgetUtils = singletonRequire('WidgetUtils')
let commonFunctions = singletonRequire('CommonFunction')
let FloatyInstance = singletonRequire('FloatyUtil')
let _logUtils = singletonRequire('LogUtils')

FloatyInstance.setFloatyInfo({x: config.device_width * 0.4, y: config.device_height / 2}, '准备执行 签到功能测试')
config._debugging = true
if (!commonFunctions.ensureAccessibilityEnabled()) {
    errorInfo('获取无障碍权限失败')
    exit()
}

// 请求截图权限
commonFunctions.requestScreenCaptureOrRestart(true)

const localOcrUtil = require("../lib/LocalOcrUtil");
let screen = commonFunctions.captureScreen()


let find = localOcrUtil.recognizeWithBounds(screen, null, '.*确认打卡.*');
if (find && find.length > 0) {
    let fistImage = find[0];
    // fistImage.saveTo("sdcard/脚本/screen.jpg");
    let bounds = fistImage.bounds

    _logUtils.debugInfo(['OCR找到了目标 [{}]: {}', "班打卡", fistImage.label])
    FloatyInstance.setFloatyInfo({
        x: bounds.centerX(),
        y: bounds.centerY()
    }, '找到了 ' + ".*班打卡.*")

    // FloatyInstance.setFloatyInfo(this.boundsToPosition(bounds), '识别到打卡按钮')
    sleep(1000)
//todo 通知打卡正常，和识别内容
} else {
    FloatyInstance.setFloatyInfo('未识别到打卡按钮')
    _logUtils.debugForDev(['未识别到打卡按钮'], true, false);

}
