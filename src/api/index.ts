import axios, { AxiosInstance, AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'

// 引入ErrorResult接口
import  {ErrorResult}  from '../interfaces/ErrorResult';
import router from '../router';

const URL: string = ''
// const URL: string = 'http://42.192.90.134:5173'
enum RequestEnums {
    TIMEOUT = 20000,
    OVERDUE = 600, // 登录失效
    FAIL = 999, // 请求失败
    SUCCESS = 200, // 请求成功
}
const config = {
    // 默认地址
    baseURL: URL as string,
    // 设置超时时间
    timeout: RequestEnums.TIMEOUT as number,
    // 跨域时候允许携带凭证
    withCredentials: true,
}

class RequestHttp {
    // 定义成员变量并指定类型
    service: AxiosInstance;
    public constructor(config: AxiosRequestConfig) {
        // 实例化axios
        this.service = axios.create(config);

        /**
         * 请求拦截器
         * 客户端发送请求 -> [请求拦截器] -> 服务器
         * token校验(JWT) : 接受服务器返回的token,存储到vuex/pinia/本地储存当中
         */
        this.service.interceptors.request.use(
            (config: any) => {
                const token = localStorage.getItem('token') || '';
                return {
                    ...config,
                    headers: {
                        'Token': token, // 请求头中携带token信息
                    }
                }
            },
            (error: AxiosError) => {
                // 请求报错
                Promise.reject(error)
            }
        )

        /**
         * 响应拦截器
         * 服务器换返回信息 -> [拦截统一处理] -> 客户端JS获取到信息
         */
        this.service.interceptors.response.use(
            (response: AxiosResponse) => {
                const { data } = response; // 解构

                if (data.code === RequestEnums.OVERDUE) {
                    // 登录信息失效，应跳转到登录页面，并清空本地的token
                    localStorage.setItem('token', '');
                    // router.replace({
                    //   path: '/login'
                    // })
                    return Promise.reject(data);
                }
                // 全局错误信息拦截（防止下载文件得时候返回数据流，没有code，直接报错）
                if (data.status && data.status !== RequestEnums.SUCCESS) {
                    console.log("data.error:" + data.error);
                    ElMessage.error(data); // 此处也可以使用组件提示报错信息
                    return Promise.reject(data)
                }
                return data;
            },
            (error: AxiosError) => {
                const { response } = error;
                if (response) {
                    console.log("response:" + (response.data as ErrorResult).code);
                    this.handleCode((response.data as ErrorResult).code)
                }
                if (!window.navigator.onLine) {
                    ElMessage.error('网络连接失败');
                    
                }
                // 处理错误的响应
                return Promise.reject(error);
            }
        )
    }
    // 全局错误处理
    handleCode(code: number): void {
        switch (code) {
            case 200:
                ElMessage.error('不存在该用户');
                break;
            case 201:
                ElMessage.error('用户名已存在');
                break;
            case 202:
                ElMessage.error('手机号已存在');
                break;
            case 203:
                ElMessage.error('用户名或密码错误');
                break;
            case 204:
                ElMessage.error('登录已失效，请重新登录');
                router.push('/login');
                break;
            default:
                ElMessage.error('请求失败');
                break;
        }
    }

    // 常用方法封装
    get<T>(url: string, params?: object): Promise<T> {
        return this.service.get(url, { params });
    }
    post<T>(url: string, params?: object): Promise<T> {
        return this.service.post(url, params);
    }
    put<T>(url: string, params?: object): Promise<T> {
        return this.service.put(url, params);
    }
    // 修改delete方法，允许传递FormData格式的数据
    delete<T>(url: string, data?: FormData): Promise<T> {
        return this.service.delete(url, { data });
    }

}

// 导出一个实例对象
export default new RequestHttp(config);
