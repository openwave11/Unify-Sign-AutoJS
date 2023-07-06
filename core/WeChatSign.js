/**
 * 微博签到
 */
let {config} = require('../config.js')(runtime, global)
let singletonRequire = require('../lib/SingletonRequirer.js')(runtime, this)
let FloatyInstance = singletonRequire('FloatyUtil')
let widgetUtils = singletonRequire('WidgetUtils')
let automator = singletonRequire('Automator')
let commonFunctions = singletonRequire('CommonFunction')
let localOcrUtil = require('../lib/LocalOcrUtil.js')

let BaseSignRunner = require('./BaseSignRunner.js')

function SignRunner() {
    // ['sign_btn', 'mine_btn', 'mine_checked_btn', 'signed_icon'])
    //'1.wechat_icon', '2.sign_btn', '3.work_space',
    //         '4.sign_banner'
    //'wechat_icon_1','sign_btn_2','work_space_3','sign_banner_4',
    console.log('自定义签到配置：', JSON.stringify(config.bb_farm_config.click_point))

    let wechatIcon_1 = config.wechat_sign_config.wechat_icon_1
    let signBtn_2 = config.wechat_sign_config.sign_btn_2
    let workSpace_3 = config.wechat_sign_config.work_space_3
    let signBanner_4 = config.wechat_sign_config.sign_banner_4
    BaseSignRunner.call(this)
    let _package_name = 'com.vmos.pro'

    this.exec = function () {
        launch(_package_name)
        sleep(1000)
        this.awaitAndSkip(['\\s*允许\\s*', '\\s*取消\\s*'])
        FloatyInstance.setFloatyText('准备查找 企业微信图标')
        let clickWechatIcon = null
        if (localOcrUtil.enabled) {
            FloatyInstance.setFloatyText('准备用OCR方式查找')
            sleep(10000)
            clickWechatIcon = this.captureAndCheckByImg(wechatIcon_1, '企业微信图标')
            // clickMine = this.captureAndCheckByOcr('^我$', '我', [config.device_width / 2, config.device_height * 0.7])
        }
        // if (!clickMine) {
        //   clickMine = this.captureAndCheckByImg(mineBtn, '我')
        //   if (!clickMine) {
        //     clickMine = this.captureAndCheckByImg(mineCheckedBtn, '我')
        //   }
        // }
        if (clickWechatIcon) {
            automator.clickCenter(clickWechatIcon)
            FloatyInstance.setFloatyText('等待打开企业微信')
            sleep(40000)
            //点击之后有可能出现pro会员提示，需要处理

            if (this.captureAndCheckByImg(signBtn_2, '自动打卡对话框', null, true)) {
                //打开自动打卡对话框 截图 32 1725 到右下角 ocr识别内容
                //如果是上午识别 上班自动打卡
                //如果是下午识别 下班自动打卡
                if (this.isAmTime()) {
                    let find = localOcrUtil.recognizeWithBounds(screen, [32, 1725], '.*上班自动打卡.*')
                    if (find && find.length > 0) {
                        let bounds = find[0].bounds
                        FloatyInstance.setFloatyInfo(this.boundsToPosition(bounds), '识别到上班自动打卡')
                        sleep(1000)
                        //todo 通知打卡正常，和识别内容
                        automator.click(bounds.centerX(), bounds.centerY())
                        sleep(1000)
                    }else {
                        //如果没识别到 点击工作台，点击打卡
                        FloatyInstance.setFloatyInfo('未识别到上班自动打卡，去工作台签到')

                        this.workSpaceSign();
                    }
                }else {
                    let find = localOcrUtil.recognizeWithBounds(screen, [32, 1725], '.*下班自动打卡.*')
                    if (find && find.length > 0) {
                        let bounds = find[0].bounds
                        FloatyInstance.setFloatyInfo(this.boundsToPosition(bounds), '识别到下班自动打卡')
                        sleep(1000)
                        //todo 通知打卡正常，和识别内容
                        automator.click(bounds.centerX(), bounds.centerY())
                        sleep(1000)
                    }else {
                        FloatyInstance.setFloatyInfo('未识别到下班自动打卡，去工作台签到')
                    }
                }
                this.setExecuted()
            } else {
                FloatyInstance.setFloatyText('未找到 自动打卡对话框，准备去工作台手动签到')
                //如果没识别到 点击工作台，点击打卡
                if (this.captureAndCheckByImg(signedIcon, '已完成签到')) {
                    this.setExecuted()
                }
            }
        } else {
            FloatyInstance.setFloatyText('未找到 企业微信图标')
            if (this.restartLimit-- >= 0) {
                FloatyInstance.setFloatyText('未找到 我 准备重开应用')
                commonFunctions.killCurrentApp()
                sleep(2000)
                this.exec()
            }
        }
        sleep(3000)
        !config._debugging && commonFunctions.minimize(_package_name)
    }

    /**
     * 判断是上午还是下午
     * @returns {boolean}
     */
    this.isAmTime = function () {
        let date = new Date();
        if (date.getHours() <= 12) {
            return true
        } else if (date.getHours() >= 12) {
            return false
        }
    }

    /**
     * 工作台手动签到
      * @returns {boolean}
     */
    this.workSpaceSign = function () {
        if (this.captureAndCheckByImg(workSpace_3, '点击工作台', null, true)) {
            if (this.captureAndCheckByImg(signBanner_4, '打卡的Banner', null, true)) {

                let find = localOcrUtil.recognizeWithBounds(screen, [340, 110], '.*班打卡.*')
                if (find && find.length > 0) {
                    let bounds = find[0].bounds
                    FloatyInstance.setFloatyInfo(this.boundsToPosition(bounds), '识别到打卡按钮')
                    sleep(1000)
                    //todo 通知打卡正常，和识别内容
                    automator.click(bounds.centerX(), bounds.centerY())
                    sleep(1000)
                }else {
                    FloatyInstance.setFloatyInfo('未识别到打卡按钮')
                }
            }else {
                FloatyInstance.setFloatyInfo('未识别到打卡的Banner')
            }
        }else {
            FloatyInstance.setFloatyInfo('未识别到点击工作台')
        }
    }

}

SignRunner.prototype = Object.create(BaseSignRunner.prototype)
SignRunner.prototype.constructor = SignRunner
module.exports = new SignRunner()
