<template>
  <view class="course-schedule">
    <view class="schedule-header">
      <text class="header-title">我的课表</text>
    </view>
    
    <!-- 课表主体 -->
    <scroll-view scroll-x class="schedule-container">
      <view class="schedule-table">
        <!-- 表头：星期 -->
        <view class="table-header">
          <view class="time-column header-cell">节次</view>
          <view v-for="day in weekDays" :key="day.value" class="day-column header-cell">
            {{ day.label }}
          </view>
        </view>
        
        <!-- 课程表格 -->
        <view v-for="section in sections" :key="section" class="table-row">
          <!-- 节次列 -->
          <view class="time-column cell">
            <text class="section-number">第{{ section }}节</text>
          </view>
          
          <!-- 每天的课程格子 -->
          <view 
            v-for="day in weekDays" 
            :key="day.value" 
            class="day-column cell"
            @click="handleCellClick(day.value, section)"
          >
            <view 
              v-if="getCourse(day.value, section)" 
              class="course-card"
              :style="{ backgroundColor: getCourse(day.value, section).color }"
            >
              <text class="course-name">{{ getCourse(day.value, section).name }}</text>
              <text class="course-location">{{ getCourse(day.value, section).location }}</text>
            </view>
            <view v-else class="empty-cell">
              <text class="add-icon">+</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
    
    <!-- 自定义编辑课程对话框 -->
    <view v-if="showPopup" class="popup-mask" @click="closePopup">
      <view class="popup-dialog" @click.stop>
        <view class="popup-title">{{ editMode ? '编辑课程' : '添加课程' }}</view>
        
        <view class="form-item">
          <text class="form-label">课程名称</text>
          <input 
            class="form-input" 
            v-model="currentCourse.name" 
            placeholder="请输入课程名称"
          />
        </view>
        
        <view class="form-item">
          <text class="form-label">教师</text>
          <input 
            class="form-input" 
            v-model="currentCourse.teacher" 
            placeholder="请输入教师姓名"
          />
        </view>
        
        <view class="form-item">
          <text class="form-label">上课地点</text>
          <input 
            class="form-input" 
            v-model="currentCourse.location" 
            placeholder="请输入上课地点"
          />
        </view>
        
        <view class="form-item">
          <text class="form-label">颜色</text>
          <view class="color-picker">
            <view 
              v-for="color in colorOptions" 
              :key="color"
              class="color-option"
              :class="{ active: currentCourse.color === color }"
              :style="{ backgroundColor: color }"
              @click="currentCourse.color = color"
            ></view>
          </view>
        </view>
        
        <view class="popup-actions">
          <button class="btn btn-cancel" @click="closePopup">取消</button>
          <button v-if="editMode" class="btn btn-delete" @click="deleteCourse">删除</button>
          <button class="btn btn-save" @click="saveCourse">保存</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { listSchedule, addSchedule, updateSchedule, delSchedule, batchSaveSchedule } from '@/api/schedule'

export default {
  name: 'CourseSchedule',
  data() {
    return {
      weekDays: [
        { label: '周一', value: 1 },
        { label: '周二', value: 2 },
        { label: '周三', value: 3 },
        { label: '周四', value: 4 },
        { label: '周五', value: 5 },
        { label: '周六', value: 6 },
        { label: '周日', value: 7 }
      ],
      sections: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], // 12节课
      courses: [], // 课程数据
      currentCourse: {
        id: '',
        day: 0,
        section: 0,
        name: '',
        teacher: '',
        location: '',
        color: '#4CAF50'
      },
      editMode: false,
      colorOptions: [
        '#4CAF50', '#2196F3', '#FF9800', '#E91E63', 
        '#9C27B0', '#00BCD4', '#FF5722', '#795548'
      ],
      showPopup: false // 弹窗显示状态
    }
  },
  mounted() {
    this.loadCourses()
  },
  methods: {
    // 从后端加载课程数据
    async loadCourses() {
      try {
        // 先尝试从后端加载
        const res = await listSchedule()
        if (res.code === 200) {
          this.courses = res.data || []
          
          // 如果后端没有数据，检查本地是否有数据需要迁移
          if (this.courses.length === 0) {
            await this.migrateLocalData()
          }
        }
      } catch (e) {
        console.error('加载课程数据失败', e)
        // 如果请求失败（比如未登录），尝试从本地加载
        this.loadLocalCourses()
      }
    },
    
    // 从本地存储加载数据（兜底方案）
    loadLocalCourses() {
      try {
        const data = uni.getStorageSync('course_schedule')
        if (data) {
          this.courses = JSON.parse(data)
        }
      } catch (e) {
        console.error('加载本地课程数据失败', e)
      }
    },
    
    // 迁移本地数据到云端
    async migrateLocalData() {
      try {
        const localData = uni.getStorageSync('course_schedule')
        if (localData) {
          const localCourses = JSON.parse(localData)
          if (localCourses.length > 0) {
            // 批量上传到云端
            const res = await batchSaveSchedule(localCourses)
            if (res.code === 200) {
              uni.showToast({
                title: '课表已同步到云端',
                icon: 'success'
              })
              // 清除本地数据
              uni.removeStorageSync('course_schedule')
              // 重新加载
              this.loadCourses()
            }
          }
        }
      } catch (e) {
        console.error('数据迁移失败', e)
      }
    },
    
    // 保存课程数据到本地存储（已废弃，保留作为兜底）
    saveCourses() {
      try {
        uni.setStorageSync('course_schedule', JSON.stringify(this.courses))
      } catch (e) {
        console.error('保存课程数据失败', e)
      }
    },
    
    // 获取指定时间的课程
    getCourse(day, section) {
      return this.courses.find(c => c.day === day && c.section === section)
    },
    
    // 处理单元格点击
    handleCellClick(day, section) {
      console.log('点击单元格:', day, section)
      const existingCourse = this.getCourse(day, section)
      
      if (existingCourse) {
        // 编辑模式
        this.editMode = true
        this.currentCourse = { ...existingCourse }
      } else {
        // 添加模式（不设置ID，由后端生成）
        this.editMode = false
        this.currentCourse = {
          day: day,
          section: section,
          name: '',
          teacher: '',
          location: '',
          color: this.colorOptions[0]
        }
      }
      
      // 显示弹窗
      this.showPopup = true
      console.log('当前课程:', this.currentCourse)
    },
    
    // 保存课程
    async saveCourse() {
      if (!this.currentCourse.name) {
        uni.showToast({
          title: '请输入课程名称',
          icon: 'none'
        })
        return
      }
      
      console.log('准备保存课程:', this.currentCourse)
      
      try {
        if (this.editMode) {
          // 更新现有课程
          const res = await updateSchedule(this.currentCourse)
          console.log('更新课程响应:', res)
          
          if (res.code === 200) {
            const index = this.courses.findIndex(c => c.id === this.currentCourse.id)
            if (index !== -1) {
              this.courses[index] = { ...this.currentCourse }
            }
            uni.showToast({
              title: '保存成功',
              icon: 'success'
            })
          }
        } else {
          // 添加新课程
          const res = await addSchedule(this.currentCourse)
          console.log('添加课程响应:', res)
          
          if (res.code === 200 && res.data) {
            // 使用后端返回的完整数据
            this.courses.push(res.data)
            console.log('课程列表已更新:', this.courses)
            
            uni.showToast({
              title: '添加成功',
              icon: 'success'
            })
          } else {
            throw new Error(res.msg || '添加失败')
          }
        }
        
        this.closePopup()
      } catch (e) {
        console.error('保存课程失败:', e)
        uni.showToast({
          title: '保存失败：' + (e.message || '请重试'),
          icon: 'none'
        })
      }
    },
    
    // 删除课程
    deleteCourse() {
      uni.showModal({
        title: '确认删除',
        content: '确定要删除这门课程吗？',
        success: async (res) => {
          if (res.confirm) {
            try {
              const result = await delSchedule(this.currentCourse.id)
              if (result.code === 200) {
                this.courses = this.courses.filter(c => c.id !== this.currentCourse.id)
                this.closePopup()
                uni.showToast({
                  title: '删除成功',
                  icon: 'success'
                })
              }
            } catch (e) {
              console.error('删除课程失败', e)
              uni.showToast({
                title: '删除失败，请重试',
                icon: 'none'
              })
            }
          }
        }
      })
    },
    
    // 关闭弹窗
    closePopup() {
      this.showPopup = false
    }
  }
}
</script>

<style scoped>
.course-schedule {
  background-color: #f5f5f5;
  padding: 20rpx;
  border-radius: 20rpx;
}

.schedule-header {
  margin-bottom: 20rpx;
}

.header-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.schedule-container {
  width: 100%;
  white-space: nowrap;
}

.schedule-table {
  display: inline-block;
  background-color: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.table-header,
.table-row {
  display: flex;
}

.time-column {
  width: 100rpx;
  flex-shrink: 0;
}

.day-column {
  width: 120rpx;
  flex-shrink: 0;
}

.header-cell {
  padding: 20rpx 10rpx;
  text-align: center;
  font-size: 28rpx;
  font-weight: bold;
  background-color: #f0f0f0;
  color: #333;
  border-bottom: 2rpx solid #e0e0e0;
}

.cell {
  padding: 8rpx;
  min-height: 120rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1rpx solid #e0e0e0;
  border-right: 1rpx solid #e0e0e0;
}

.section-number {
  font-size: 24rpx;
  color: #666;
}

.course-card {
  width: 100%;
  height: 100%;
  padding: 10rpx;
  border-radius: 8rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.course-name {
  font-size: 20rpx;
  font-weight: bold;
  color: #fff;
  margin-bottom: 4rpx;
  text-align: center;
  word-break: break-all;
  line-height: 1.4;
  overflow: visible;
  white-space: normal;
}

.course-location {
  font-size: 18rpx;
  color: rgba(255, 255, 255, 0.9);
  text-align: center;
  word-break: break-all;
  line-height: 1.2;
}

.empty-cell {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.3;
}

.add-icon {
  font-size: 40rpx;
  color: #999;
}

/* 自定义弹窗样式 */
.popup-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.popup-dialog {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 40rpx;
  min-width: 500rpx;
  max-width: 650rpx;
  width: 90vw;
  max-height: 70vh;
  overflow-y: auto;
}

.popup-title {
  font-size: 36rpx;
  font-weight: bold;
  margin-bottom: 30rpx;
  text-align: center;
}

.form-item {
  margin-bottom: 30rpx;
}

.form-label {
  display: block;
  font-size: 28rpx;
  color: #333;
  margin-bottom: 10rpx;
}

.form-input {
  width: 100%;
  height: 80rpx;
  padding: 20rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 8rpx;
  font-size: 28rpx;
  box-sizing: border-box;
  line-height: 40rpx;
}

.color-picker {
  display: flex;
  gap: 20rpx;
  flex-wrap: wrap;
}

.color-option {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  border: 4rpx solid transparent;
}

.color-option.active {
  border-color: #333;
  box-shadow: 0 0 0 4rpx rgba(0, 0, 0, 0.1);
}

.popup-actions {
  display: flex;
  gap: 20rpx;
  margin-top: 40rpx;
}

.btn {
  flex: 1;
  padding: 20rpx;
  border-radius: 8rpx;
  font-size: 28rpx;
  border: none;
}

.btn-cancel {
  background-color: #f5f5f5;
  color: #666;
}

.btn-delete {
  background-color: #ff4444;
  color: #fff;
}

.btn-save {
  background-color: #4CAF50;
  color: #fff;
}
</style>
