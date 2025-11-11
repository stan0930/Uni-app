<script>
  import config from './config'
  import { getToken } from '@/utils/auth'

  export default {
    onLaunch: function() {
      this.initApp()
    },
    methods: {
      // 初始化应用
      initApp() {
        // 初始化应用配置
        this.initConfig()
        // 检查用户登录状态
        //#ifdef H5
        this.checkLogin()
        //#endif
      },
      initConfig() {
        this.globalData.config = config
      },
      checkLogin() {
        if (!getToken()) {
          this.$tab.reLaunch('/pages/login') 
        }
      }
    }
  }
</script>

<style lang="scss">
  @import '@/static/scss/index.scss'
</style>

<style lang="scss">
  /* 1. 导入基础 scss */
  @import "@/static/scss/global.scss";
  @import "@/uni_modules/uni-scss/variables.scss";

  /* 2. 定义全局颜色变量 */
  :root {
    --primary-color: #409EFF; /* RuoYi 蓝 */
    --primary-color-light: #ecf5ff;
    --primary-color-dark: #3a8ee6;
    --page-bg-color: #f4f6f8; /* 全局页面背景色 */
    --card-bg-color: #ffffff;
    --text-color-primary: #303133;
    --text-color-regular: #606266;
    --text-color-secondary: #909399;
    --border-color: #e4e7ed;
    --card-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }

  /* 3. 全局页面样式 */
  page {
    background-color: var(--page-bg-color);
    color: var(--text-color-primary);
    font-size: 14px;
    line-height: 1.6;
  }
  
  /* 4. 统一定义卡片容器样式 */
  .card-container {
    background-color: var(--card-bg-color);
    border-radius: 10px;
    padding: 16px;
    margin: 12px;
    box-shadow: var(--card-shadow);
  }
  
  /* 5. 统一定义主按钮样式 */
  .primary-button {
    background: linear-gradient(to right, var(--primary-color-light), var(--primary-color)) !important;
    background-color: var(--primary-color) !important; /* 兼容 */
    color: #ffffff !important;
    border-radius: 50px !important;
    font-size: 16px !important;
    height: 44px;
    line-height: 44px;
    box-shadow: 0 4px 10px rgba(64, 158, 255, 0.4);
  }

  /* 6. 统一定义表单输入框样式 */
  .form-item-wrapper {
    background-color: var(--card-bg-color);
    padding: 10px 15px;
    border-radius: 8px;
    margin-bottom: 15px;
    display: flex;
    align-items: center;
    border: 1px solid var(--border-color);
  }
</style>