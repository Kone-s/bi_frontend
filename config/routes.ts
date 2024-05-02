export default [
  { path: '/user', layout: false, routes: [{ path: '/user/login', component: './User/Login' }] },
  { path: '/', redirect: '/welcome' },
  { path: '/welcome', name: '欢迎', icon: 'HeartOutlined', component: './Welcome' },
  { path: '/chart', name: '数据分析', icon: 'DotChartOutlined', component: './AddChart' },
  { path: '/chartasync', name: '批量分析', icon: 'BoxPlotOutlined', component: './AddChartAsync' },
  { path: '/mychart', name: '我的图表', icon: 'PieChartOutlined', component: './MyChart' },
  { path: '/myinfo', name: '我的信息', icon: 'UnorderedListOutlined', component: './User/Settings' },
  {
    path: '/admin',
    name: '管理',
    icon: 'crown',
    access: 'canAdmin',
    routes: [
      {
        name: '用户管理',
        path: '/admin/user',
        component: './Admin/User',
      },
      {
        name: '图表管理',
        path: '/admin/chart',
        component: 'Admin/Chart',
      },
    ],
  },
  { path: '*', layout: false, component: './404' },
];
