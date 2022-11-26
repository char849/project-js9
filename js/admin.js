// 匯入 c3.js
import 'https://cdnjs.cloudflare.com/ajax/libs/d3/5.16.0/d3.min.js';
import 'https://cdnjs.cloudflare.com/ajax/libs/c3/0.7.20/c3.min.js';

// 匯入 共用 API
import * as api from './api.js';

let orderData = [];
const orderList = document.querySelector(".js-orderList");

// 初始化
function init() {
  getOrderList();
}
init();

// c3圖片及api資料整合
function renderC3() {
  console.log(orderData);
  // 物件資料整理
  let total = {};
  orderData.forEach((item) => {
    item.products.forEach((productItem) => {
      if (total[productItem.category] == undefined) {
        total[productItem.category] = productItem.price * productItem.quantity;
      } else {
        total[productItem.category] += productItem.price * productItem.quantity;
      }
    });
  });
  console.log(total);
  // 物件轉成陣列
  let categoryArry = Object.keys(total);
  console.log(categoryArry);
  // 組c3.js格式
  let newData = [];
  categoryArry.forEach((item) => {
    let ary = [];
    ary.push(item);
    //console.log(item)
    ary.push(total[item]);
    //console.log(total[item]);
    newData.push(ary);
  });
  console.log(newData);
  // C3.js
  let chart = c3.generate({
    bindto: "#chart", // HTML 元素綁定
    data: {
      type: "pie",
      columns: newData,
    },
  });
}

// 取得訂單列表
function getOrderList() {
  // loading 顯示
  document.getElementById("preloder").style.display = "block";
  axios
    api.getOrders()
    .then((res) => {
      orderData = res.data.orders;
      let str = "";
      orderData.forEach((item) => {
        // 組時間戳字串
        const tiemStamp = new Date(item.createdAt * 1000); // 取豪秒到13碼
        const orderTime = `${tiemStamp.getFullYear()}/${
          tiemStamp.getMonth() + 1
        }/${tiemStamp.getDate()}`;
        // 組單筆訂單品項及數量字串
        let productStr = "";
        item.products.forEach((productItem) => {
          productStr += `<p>${productItem.title}x${productItem.quantity}</p>`;
        });
        // 判斷訂單狀態
        let orderStatus = "";
        if (item.paid == true) {
          orderStatus = "己處理";
        } else {
          orderStatus = "未處理";
        }
        // 顯示訂單列表
        str += ` <tr>
            <td>${item.id}</td>
            <td>
              <p>${item.user.name}</p>
              <p>${item.user.tel}</p>
            </td>
            <td>${item.user.address}</td>
            <td>${item.user.email}</td>
            <td>
              <p>${productStr}</p>
            </td>
            <td>${orderTime}</td>
            <td class="orderStatus">
              <a href="#" class="js-orderStatus" data-status="${item.paid}" data-id="${item.id}">${orderStatus}</a>
            </td>
            <td>
              <input type="button" class="delSingleOrder-Btn js-orderDelete" data-id="${item.id}" value="刪除">
            </td>
          </tr>`;
      });
      orderList.innerHTML = str;
      renderC3();
    })    
    .finally(() => {
      // loading 消失
      document.getElementById("preloder").style.display = "none";
    });
}

// 修改訂單狀態及修改單筆訂單監聽
orderList.addEventListener("click", (e) => {
  e.preventDefault();
  const targetClass = e.target.getAttribute("class");
  let id = e.target.getAttribute("data-id");
  if (targetClass == "delSingleOrder-Btn js-orderDelete") {
    delOrderItem(id);
    return;
  }
  if (targetClass == "js-orderStatus") {
    let status = e.target.getAttribute("data-status");
    changeOrderStatus(status, id);
    return;
  }
});

// 修改單筆訂單狀態
function changeOrderStatus(status, id) {
  console.log(status, id);
  let newStatus;
  if (newStatus == true) {
    newStatus = false;
  } else {
    newStatus = true;
  }
  // loading 顯示
  document.getElementById("preloder").style.display = "block";
  axios
    api.updateOrder({
        data: {
          id: id,
          paid: newStatus,
        }
      })
    .then((res) => {
      Swal.fire("修改訂單狀態成功", "變更狀態", "success");
      getOrderList();
    })
    .finally(() => {
      // loading 消失
      document.getElementById("preloder").style.display = "none";
    });
}

// 刪除單筆訂單
function delOrderItem(id) {
  // loading 顯示
  document.getElementById("preloder").style.display = "block";
  axios
    api.deleteOrder()
    .then((res) => {
      Swal.fire("刪除該筆訂單成功", "己刪除單筆訂單", "success");
      getOrderList();
    })
    .finally(() => {
      // loading 消失
      document.getElementById("preloder").style.display = "none";
    });
}

// 刪除全部訂單
const discardAllBtn = document.querySelector('.discardAllBtn');
discardAllBtn.addEventListener('click', (e)=>{
    e.preventDefault();
    axios
    api.deleteAllOrders()
    .then((res) => {
      Swal.fire("刪除全部訂單成功", "己刪除全部訂單", "success");
      getOrderList();
    });
})
