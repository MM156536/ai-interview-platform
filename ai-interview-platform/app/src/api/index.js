// API进行统一管理
import requests from './request'

// 接收参数并传递给接口
export const reqLogin = (params) => {
  return requests({
    url: '/admin/admin/login',
    method: 'post',
    params: params // Query 参数用 params 传
  });
}