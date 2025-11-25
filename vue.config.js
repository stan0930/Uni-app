module.exports = {
    devServer: {
        port: 9090,
        proxy: {
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
