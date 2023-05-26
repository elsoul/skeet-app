import appSetting from '../../app.json'

const appConfig = {
  domain: 'enha.app',
  iosId: appSetting.expo.ios.bundleIdentifier,
  androidId: appSetting.expo.android.package,
  skeetApiDomain: 'lb.enha.app',
  localIp: '192.168.2.35',
}

export default appConfig
