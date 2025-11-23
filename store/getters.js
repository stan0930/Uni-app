const getters = {
  token: state => state.user.token,
  avatar: state => state.user.avatar,
  name: state => state.user.name,
  
  // 【新增】映射 userId
  userId: state => state.user.userId,
  
  nickName: state => state.user.nickName || state.user.name,
  phonenumber: state => state.user.phonenumber,
  email: state => state.user.email,
  sex: state => state.user.sex,
  
  roles: state => state.user.roles,
  permissions: state => state.user.permissions
}
export default getters