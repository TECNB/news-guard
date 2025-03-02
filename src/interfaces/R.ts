export interface R<T> {
    code: number; // 响应码
    message: string; // 响应信息
    data: T; // 泛型数据，类型为 T
}
