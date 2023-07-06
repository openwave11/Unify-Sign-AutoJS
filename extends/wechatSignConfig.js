
module.exports = function (binder) {
    // 扩展配置
    /**
     * param1: 指定自定义配置的前缀 需要保持唯一
     * param2: 指定自定义配置的初始化值 仅仅保存图片信息时传递空对象即可
     * param3: 指定自定义图像配置的字段列表
     */
    binder.bindCustomSignConfig('wechat_sign', {

    }, [
        'wechat_icon_1','sign_btn_2','work_space_3','sign_banner_4'
    ])
}
