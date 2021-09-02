module.exports = {
  apps: [
    {
      name: 'wechat-demo', // 启动进程名
      script: './src/app.js', // 启动文件
      instances: 2, // 启动进程数
      exec_mode: 'cluster', // 多进程多实例
    },
  ],
}
