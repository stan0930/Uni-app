module.exports = {
    devServer: {
        port: 9090,
        proxy: {
            '/dev-api': {
                target: 'http://127.0.0.1:8080',
                changeOrigin: true,
                pathRewrite: {
                    '^/dev-api': ''
                }
            },
            '/dashscope': {
                target: 'https://dashscope.aliyuncs.com',
                changeOrigin: true,
                pathRewrite: {
                    '^/dashscope': ''
                }
            }
        }
    }
}
