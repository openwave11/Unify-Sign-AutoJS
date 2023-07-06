/**
 * 微博签到
 */
let {config} = require('../config.js')(runtime, global)
let singletonRequire = require('../lib/SingletonRequirer.js')(runtime, this)
let FloatyInstance = singletonRequire('FloatyUtil')
let widgetUtils = singletonRequire('WidgetUtils')
let automator = singletonRequire('Automator')
let _logUtils = singletonRequire('LogUtils')
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
    let sign_banner_4_2 = config.wechat_sign_config.sign_banner_4_2
    let sign_btn_back_5 = config.wechat_sign_config.sign_btn_back_5

    this.restartLimit = 3

    BaseSignRunner.call(this)
    let _package_name = 'com.vmos.pro'

    this.exec = function () {
        // _logUtils.debugForDev(['waitFor方法执行完毕，action result: {}, wait result: {} cost time: {}ms', actionSuccess, waitResult, new Date().getTime() - start])
        _logUtils.debugForDev(['开始企业微信签到'], true, false)

        launch(_package_name)
        sleep(1000)
        this.awaitAndSkip(['\\s*允许\\s*', '\\s*取消\\s*'])
        FloatyInstance.setFloatyText('准备查找 企业微信图标')
        _logUtils.debugForDev(['准备查找 企业微信图标'], true, false)
        let clickWechatIcon = null
        if (localOcrUtil.enabled) {
            FloatyInstance.setFloatyText('准备用OCR方式查找')
            _logUtils.debugForDev(['准备用OCR方式查找'], true, false)
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
            _logUtils.debugForDev(['自动打卡对话框'], true, false)
            if (this.captureAndCheckByImg(signBtn_2, '自动打卡对话框', null, true)) {
                //打开自动打卡对话框 截图 32 1725 到右下角 ocr识别内容
                //如果是上午识别 上班自动打卡
                //如果是下午识别 下班自动打卡
                if (this.isAmTime()) {
                    _logUtils.debugForDev(['早上，准备识别上班自动打卡'], true, false)

                    let screen = commonFunctions.captureScreen()
                    let find = localOcrUtil.recognizeWithBounds(screen, [32, 1725], '.*上班自动打卡.*')
                    if (find && find.length > 0) {
                        let bounds = find[0].bounds
                        FloatyInstance.setFloatyInfo(this.boundsToPosition(bounds), '识别到上班自动打卡')
                        sleep(1000)
                        //todo 通知打卡正常，和识别内容
                        automator.click(bounds.centerX(), bounds.centerY())
                        sleep(1000)
                    } else {
                        //如果没识别到 点击工作台，点击打卡
                        FloatyInstance.setFloatyInfo('未识别到上班自动打卡，去工作台签到')
                        _logUtils.debugForDev(['早上，未识别到上班自动打卡，去工作台签到'], true, false)

                        this.captureAndCheckByImg(sign_btn_back_5, '点击返回按钮，返回首页', null, true)

                        this.workSpaceSign();
                    }
                } else {
                    _logUtils.debugForDev(['下午，准备识别下班自动打卡'], true, false)

                    let screen = commonFunctions.captureScreen()
                    let find = localOcrUtil.recognizeWithBounds(screen, [32, 1725], '.*下班自动打卡.*')
                    if (find && find.length > 0) {
                        let bounds = find[0].bounds
                        FloatyInstance.setFloatyInfo(this.boundsToPosition(bounds), '识别到下班自动打卡')
                        sleep(1000)
                        //todo 通知打卡正常，和识别内容
                        automator.click(bounds.centerX(), bounds.centerY())
                        sleep(1000)
                    } else {
                        FloatyInstance.setFloatyInfo('未识别到下班自动打卡，去工作台签到')
                        _logUtils.debugForDev(['下午，未识别到下班自动打卡，去工作台签到'], true, false)
                        this.captureAndCheckByImg(sign_btn_back_5, '点击返回按钮，返回首页', null, true)

                        this.workSpaceSign();

                    }
                }
                this.setExecuted()
            } else {
                FloatyInstance.setFloatyText('未找到 自动打卡对话框，准备去工作台手动签到')
                _logUtils.debugForDev(['未找到 自动打卡对话框，准备去工作台手动签到'], true, false)
                //如果没识别到 点击工作台，点击打卡
                this.workSpaceSign();
            }
        } else {
            FloatyInstance.setFloatyText('未找到 企业微信图标，准备去工作台手动签到')
            _logUtils.debugForDev(['未找到 企业微信图标，准备去工作台手动签到'], true, false)

            this.captureAndCheckByImg(sign_btn_back_5, '点击返回按钮，返回首页', null, true)
            //如果没识别到 点击工作台，点击打卡
            this.workSpaceSign();

        }
        //如果今天没执行过，并且重启次数大于1，重新开启应用
        if (!this.executeIfNeeded()) {
            if (this.restartLimit-- >= 0) {
                FloatyInstance.setFloatyText('如果今天没执行过，并且重启次数大于1，重新开启应用')
                _logUtils.debugForDev(['如果今天没执行过，并且重启次数大于1，重新开启应用'], true, false)
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
        _logUtils.debugForDev(['进入到工作台签到，开始识别并点击工作台'], true, false)
        if (this.captureAndCheckByImg(workSpace_3, '点击工作台', null, true)) {

            _logUtils.debugForDev(['进入到工作台签到，开始识别并点击工作台'], true, false)
            //如果没找到第一个banner找第二个banner
            let ocrSignBanner_4_flag = this.captureAndCheckByImg(signBanner_4, '打卡的Banner', null, true);
            if (!ocrSignBanner_4_flag) {
                ocrSignBanner_4_flag = this.captureAndCheckByImg(sign_banner_4_2, '打卡的Banner', null, true);
                if (!ocrSignBanner_4_flag) {
                    automator.scrollDown()
                    ocrSignBanner_4_flag = this.captureAndCheckByImg(sign_banner_4_2, '打卡的Banner', null, true);
                }
            }
            _logUtils.debugForDev(['截图完成查找打卡banner完成结果为：' + ocrSignBanner_4_flag.toString()], true, false);
            if (ocrSignBanner_4_flag) {
                sleep(2000)

                let screen = commonFunctions.captureScreen()
                let find = localOcrUtil.recognizeWithBounds(screen, [340, 1110], '.*班打卡.*');
                if (find && find.length > 0) {
                    let bounds = find[0].bounds
                    FloatyInstance.setFloatyInfo(this.boundsToPosition(bounds), '识别到打卡按钮')
                    sleep(1000)
                    //todo 通知打卡正常，和识别内容
                    automator.click(bounds.centerX(), bounds.centerY())
                    sleep(2000)

                    //截屏识别确认打卡按钮
                    let screen = commonFunctions.captureScreen()
                    let confirmSign = localOcrUtil.recognizeWithBounds(screen, null, '.*确认打卡.*')
                    if (confirmSign && confirmSign.length > 0) {
                        let confirmSignbounds = confirmSign[0].bounds
                        FloatyInstance.setFloatyInfo(this.boundsToPosition(confirmSignbounds), '识别到确认打卡')
                        sleep(1000)
                        //todo 通知打卡正常，和识别内容
                        automator.click(confirmSignbounds.centerX(), confirmSignbounds.centerY())
                        sleep(1000)
                    }

                    this.setExecuted()
                } else {
                    FloatyInstance.setFloatyInfo('未识别到打卡按钮')
                    _logUtils.debugForDev(['未识别到打卡按钮'], true, false);

                }
            } else {
                FloatyInstance.setFloatyInfo('未识别到打卡的Banner');
                _logUtils.debugForDev(['未识别到打卡按钮'], true, false);
            }
        } else {
            FloatyInstance.setFloatyInfo('未识别到点击工作台')
            _logUtils.debugForDev(['未识别到点击工作台'], true, false);
        }
    }

}

SignRunner.prototype = Object.create(BaseSignRunner.prototype)
SignRunner.prototype.constructor = SignRunner
module.exports = new SignRunner()
