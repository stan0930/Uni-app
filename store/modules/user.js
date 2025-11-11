import { login, logout, getInfo } from '@/api/login' //
import { getToken, setToken, removeToken } from '@/utils/auth'

const user = {
  state: {
    token: getToken(),
    name: '',
    
    // 【新增】扩展 state 以存储详细信息
    nickName: '', 
    avatar: '',
    phonenumber: '',
    email: '',
    sex: '',
    
    roles: [],
    permissions: []
  },

  mutations: {
    SET_TOKEN: (state, token) => {
      state.token = token
    },
    SET_NAME: (state, name) => {
      state.name = name
    },
    
    // 【新增】对应的 Mutations
    SET_NICKNAME: (state, nickName) => {
      state.nickName = nickName
    },
    SET_AVATAR: (state, avatar) => {
      state.avatar = avatar
    },
    SET_PHONENUMBER: (state, phonenumber) => {
      state.phonenumber = phonenumber
    },
    SET_EMAIL: (state, email) => {
      state.email = email
    },
    SET_SEX: (state, sex) => {
      state.sex = sex
    },
    
    SET_ROLES: (state, roles) => {
      state.roles = roles
    },
    SET_PERMISSIONS: (state, permissions) => {
      state.permissions = permissions
    }
  },

  actions: {
    // 登录
    Login({ commit }, userInfo) {
      const username = userInfo.username.trim()
      const password = userInfo.password
      const code = userInfo.code
      const uuid = userInfo.uuid
      return new Promise((resolve, reject) => {
        login(username, password, code, uuid).then(res => {
          setToken(res.token)
          commit('SET_TOKEN', res.token)
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 获取用户信息 (核心修正点)
    GetInfo({ commit, state }) {
      return new Promise((resolve, reject) => {
        getInfo().then(res => {
          const user = res.user
          
          // 【修正】存储完整的用户信息
          commit('SET_NAME', user.userName)
          commit('SET_NICKNAME', user.nickName)
          commit('SET_AVATAR', user.avatar)
          commit('SET_PHONENUMBER', user.phonenumber)
          commit('SET_EMAIL', user.email)
          commit('SET_SEX', user.sex)
          
          commit('SET_ROLES', res.roles)
          commit('SET_PERMISSIONS', res.permissions)
          resolve(res)
        }).catch(error => {
          reject(error)
        })
      })
    },
    
    // 退出系统 (保持不变)
    LogOut({ commit, state }) {
      return new Promise((resolve, reject) => {
        logout(state.token).then(() => {
          commit('SET_TOKEN', '')
          commit('SET_ROLES', [])
          commit('SET_PERMISSIONS', [])
          removeToken()
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    }
  }
}

export default user