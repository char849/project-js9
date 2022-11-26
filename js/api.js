import "https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js";

//const api_path ="charlotte-lee";
const token = "lnn1lxFoXZeimoqvqEFBuqzxmzH2";

// 前台使用者
const userRequest = axios.create({
    baseURL: 'https://livejs-api.hexschool.io/api/livejs/v1/customer/charlotte-lee/',
    headers: {
        'Content-Type': 'application/json',
    }
});

// 後台管理者
const adminRequest = axios.create({
    baseURL: 'https://livejs-api.hexschool.io/api/livejs/v1/admin/charlotte-lee',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
    }
});

// 前台 
// 產品 API
export const getProductList = () => userRequest.get('/products');

// 購物車 API
export const addCart = (data) => userRequest.post('/carts',data);
export const getCarts = () => userRequest.get('/carts');
export const deleteCart = (id) => userRequest.delete(`/carts/${id}`);
export const deleteAllCarts = () => userRequest.delete('/carts');
export const apiAddOrder = (data) => userRequest.post('/orders',data);

// 後台 - 訂單 API
export const getOrders = () => adminRequest.get('/orders');
export const updateOrder  = (data) => adminRequest.put('/orders', data);
export const deleteOrder = (id) => adminRequest.delete(`/orders/${id}`);
export const deleteAllOrders = () => adminRequest.delete(`/orders`);

