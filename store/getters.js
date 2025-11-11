const getters = {
  token: state => state.user.token,
  avatar: state => state.user.avatar,
  name: state => state.user.name,
  
  // 【新增】暴露详细信息给 mapGetters
  nickName: state => state.user.nickName || state.user.name, // 如果昵称为空，则使用用户名
  phonenumber: state => state.user.phonenumber,
  email: state => state.user.email,
  sex: state => state.user.sex,
  
  roles: state => state.user.roles,
  permissions: state => state.user.permissions
}
export default getters