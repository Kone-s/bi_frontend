﻿export default [
  { path: '/user', layout: false, routes: [{ path: '/user/login', component: './User/Login' }] },
  { path: '/', redirect: '/welcome' },
  { path: '/welcome', name: '欢迎', icon: 'HeartOutlined', component: './Welcome' },
  { path: '/chart', name: '数据分析', icon: 'DotChartOutlined', component: './AddChart' },
  { path: '/chartasync', name: '批量分析', icon: 'BoxPlotOutlined', component: './AddChartAsync' },
  { path: '/mychart', name: '我的图表', icon: 'PieChartOutlined', component: './MyChart' },
  { path: '/myinfo', name: '我的信息', icon: 'UnorderedListOutlined', component: './User/settings' },
  {
    path: '/admin',
    icon: 'crown',
    access: 'canAdmin',
    routes: [
      { path: '/admin', name: '管理页面', redirect: '/admin/sub-page' },
      { path: '/admin/sub-page', name: '管理页面2', component: './Admin' },
    ],
  },
  { path: '/', redirect: '/welcome' },
  { path: '*', layout: false, component: './404' },
];
