<template>
  <view class="container">
    <uni-section title="代办事项" type="line" padding>
      <view class="content">
        <text>当前暂无代办事项，或功能正在完善中。</text>
        <uni-icons type="calendar" size="50" color="#e6a23c" style="margin-top: 20px;"></uni-icons>
      </view>
    </uni-section>
  </view>
</template>
<script>
export default {}
</script>
<style scoped>
.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px;
  font-size: 16px;
  color: #909399;
}
</style>