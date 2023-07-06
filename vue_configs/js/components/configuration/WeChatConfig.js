
const WeChatConfig = {
  name: 'WeChatConfig',
  mixins: [mixin_common],
  data () {
    return {
      configs: {
        // 'wechat_icon_1','sign_btn_2','work_space_3','sign_banner_4',
        wechat_icon_1: '',
        sign_btn_2: '',
        work_space_3: '',
        sign_banner_4: '',
      },
    }
  },
  methods: {
    onConfigLoad (config) {
      let wechatSignConfig = config.wechat_sign_config
      Object.keys(this.configs).forEach(key => {
        this.$set(this.configs, key, wechatSignConfig[key])
      })
    },
    doSaveConfigs () {
      let newConfigs = this.filterErrorFields(this.configs)
      $app.invoke('saveExtendConfigs', { configs: newConfigs, prepend: 'wechatSign' })
    },
    openGrayDetector: function () {
      $app.invoke('openGrayDetector', {})
    },
  },
  template: `
  <div>
    <van-divider content-position="left">\
      签到识图配置\
    </van-divider>\
    <tip-block style="margin: 0.5rem">区域输入框左滑可以通过滑块输入数值，也可以通过取色工具获取目标区域信息：<van-button style="margin-left: 0.4rem" plain hairline type="primary" size="mini" @click="openGrayDetector">打开取色工具</van-button></tip-block>
    <base64-image-viewer title="校验‘企业微信图标’按钮" v-model="configs.wechat_icon_1"/>
    <base64-image-viewer title="校验消息中的‘打卡’按钮" v-model="configs.sign_btn_2"/>
    <base64-image-viewer title="校验‘工作台’按钮" v-model="configs.work_space_3"/>
    <base64-image-viewer title="校验‘签到的banner’" v-model="configs.sign_banner_4"/>
    
  </div>`
}
