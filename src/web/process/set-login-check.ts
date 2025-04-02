document.addEventListener('登录成功', () => {
  window.location.assign('/')
})
document.addEventListener('检测到未登录', () => {
  window.location.assign('/login.html')
})
