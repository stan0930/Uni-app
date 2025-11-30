<template>
  <view class="container">
    <course-schedule :readonly="false"></course-schedule>
  </view>
</template>

<script>
import CourseSchedule from '@/components/course-schedule/course-schedule.vue'

export default {
  components: {
    CourseSchedule
  },
  data() {
    return {}
  }
}
</script>

<style scoped>
.container {
  padding: 20rpx;
  min-height: 100vh;
  background-color: #f5f7fa;
}
</style>