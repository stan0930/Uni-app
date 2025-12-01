// 应用全局配置示例文件
// 使用说明：
// 1. 复制此文件并重命名为 config.js
// 2. 根据你的实际环境修改 baseUrl
// 3. config.js 不会被提交到 git 仓库

module.exports = {
    // 后端API地址，根据实际情况修改：
    // - 本地开发：http://localhost:8080
    // - 局域网测试：http://192.168.x.x:8080
    // - 生产环境：https://your-domain.com/prod-api
    baseUrl: 'http://localhost:8080',

    // 应用信息
    appInfo: {
        // 应用名称
        name: "ruoyi-app",
        // 应用版本
        version: "1.2.0",
        // 应用logo
        logo: "/static/logo.png",
        // 官方网站
        site_url: "http://ruoyi.vip",
        // 政策协议
        agreements: [{
            title: "隐私政策",
            url: "https://ruoyi.vip/protocol.html"
        },
        {
            title: "用户服务协议",
            url: "https://ruoyi.vip/protocol.html"
        }
        ]
    }
}
