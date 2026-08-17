const fs = require('fs');
const path = require('path');
const { withAndroidManifest } = require('@expo/config-plugins');

// 允许 HTTP 明文流量（后端是 http://120.48.13.152:60135）
const NSC_XML = `<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <base-config cleartextTrafficPermitted="true">
        <trust-anchors>
            <certificates src="system" />
        </trust-anchors>
    </base-config>
</network-security-config>`;

function withAllowHttp(config) {
  config = withAndroidManifest(config, (config) => {
    // 写入 res/xml/network_security_config.xml
    const resDir = path.join(
      config.modRequest.platformProjectRoot,
      'app/src/main/res/xml'
    );
    fs.mkdirSync(resDir, { recursive: true });
    fs.writeFileSync(
      path.join(resDir, 'network_security_config.xml'),
      NSC_XML
    );

    // 在 application 节点上挂 cleartext 开关并引用上面的配置
    const app = config.modResults.manifest.application?.[0];
    if (app) {
      app.$['android:usesCleartextTraffic'] = 'true';
      app.$['android:networkSecurityConfig'] = '@xml/network_security_config';
    }
    return config;
  });

  return config;
}

module.exports = withAllowHttp;
