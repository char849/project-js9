// console.log(api_path, token)
const productList = document.querySelector(".productWrap");
const productSelect = document.querySelector(".productSelect");
const cartList = document.querySelector(".shoppingCart-tableList");
const form = document.querySelector(".orderInfo-form");
const inputs = document.querySelectorAll("input[name],select[data=payment]");

const constraints = {
  姓名: {
    presence: {
      message: "必填欄位",
    },
  },
  電話: {
    presence: {
      message: "必填欄位",
    },
    length: {
      minimum: 8,
      message: "需超過 8 碼",
    },
  },
  信箱: {
    presence: {
      message: "是必填的欄位",
    },
    format: {
      pattern: /^[^@\s]+@[^@\s]+\.[^@\s]+$/,
      message: "格式輸入錯誤",
    },
  },
  寄送地址: {
    presence: {
      message: "必填欄位",
    },
  },
  交易方式: {
    presence: {
      message: "必填欄位",
    },
  },
};

// 欄位驗證
inputs.forEach((item) => {
  item.addEventListener("change", function () {
    item.nextElementSibling.textContent = "";
    let errors = validate(form, constraints) || "";
    console.log(errors);

    if (errors) {
      formCheck(errors);
      return;
    }
  });
});
function formCheck(errors) {
  Object.keys(errors).forEach(function (keys) {
    // console.log(document.querySelector(`[data-message=${keys}]`))
    document.querySelector(`[data-message="${keys}"]`).textContent =
      errors[keys];
  });
}

let productData = [];
let cartData = [];
function init() {
  getProductList();
  getCartList();
}
init();
function getProductList() {
  // loading 顯示
  document.getElementById("preloder").style.display = "block";
  axios
    .get(
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/products`
    )
    .then((res) => {
      productData = res.data.products;
      renderProductList();
    })
    
    .finally(() => {
      // loading 消失
      document.getElementById("preloder").style.display = "none";
    });
}

// 消除重複的函式
function strChange(item) {
  return `<li class="productCard">
    <h4 class="productType">新品</h4>
    <img
      src="${item.images}"
      alt="">
    <a href="#" class="js-addCart" data-id="${item.id}">加入購物車</a>
    <h3>${item.title}</h3>
    <del class="originPrice">NT$${toThousands(item.origin_price)}</del>
    <p class="nowPrice">NT$${toThousands(item.price)}</p>
  </li>`;
}

// 顯示全部
function renderProductList() {
  let str = "";
  productData.forEach((item) => {
    str += strChange(item);
  });
  productList.innerHTML = str;
}
productSelect.addEventListener("change", (e) => {
  const category = e.target.value;
  if (category == "全部") {
    renderProductList();
    return;
  }
  // 組字串 + 消除重複 strChange(item)
  let str = "";
  productData.forEach((item) => {
    if (item.category == category) {
      str += strChange(item);
    }
  });
  productList.innerHTML = str;
});

// 加入購物車 取得 data-id
productList.addEventListener("click", (e) => {
  e.preventDefault();
  let addCartClass = e.target.getAttribute("class");
  if (addCartClass !== "js-addCart") {
    // alert('你點到別的東西了')
    return;
  }
  let productId = e.target.getAttribute("data-id");
  console.log(productId);

  // 加入購物車增加數量
  let numCart = 1;
  cartData.forEach((item) => {
    if (item.product.id === productId) {
      numCart = item.quantity += 1;
    }
  });
  // console.log(numCart)
  // loading 顯示
  document.getElementById("preloder").style.display = "block";
  axios
    .post(
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`,
      {
        data: {
          productId: productId,
          quantity: numCart,
        },
      }
    )
    .then((res) => {
      console.log(res);
      Swal.fire("新增成功", "加入購物車", "success");
      // 重新渲染購物車列表資料
      getCartList();
    })    
    .finally(() => {
      // loading 消失
      document.getElementById("preloder").style.display = "none";
    });
});

function getCartList() {
  axios
    .get(
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`
    )
    .then((res) => {
      // console.log(res.data)
      // 將總金額的金錢覆寫進去
      document.querySelector(".js-total").textContent = toThousands(
        res.data.finalTotal
      );
      cartData = res.data.carts;
      let str = "";
      cartData.forEach((item) => {
        str += `<tr>
            <td>
              <div class="cardItem-title">
                <img src="${item.product.images}" alt="">
                <p>${item.product.title}</p>
              </div>
            </td>
            <td>NT$${toThousands(item.product.price)}</td>
            <td>${item.quantity}</td>
            <td>NT$${toThousands(item.product.price * item.quantity)}</td>
            <td class="discardBtn">
              <a href="#" class="material-icons" data-id="${item.id}">
                clear
              </a>
            </td>
          </tr>`;
      });
      cartList.innerHTML = str;
    });
}

cartList.addEventListener("click", (e) => {
  e.preventDefault();
  //console.log(e.target)
  const cartId = e.target.getAttribute("data-id");
  if (cartId == null) {
    // alert('你點到別的地方了')
    return;
  }
  console.log(cartId);
  // 刪除單筆購物車項目
  // loading 顯示
  document.getElementById("preloder").style.display = "block";
  axios
    .delete(
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts/${cartId}`
    )
    .then((res) => {
      Swal.fire("刪除成功", "刪除單筆購物車成功", "success");
      // 重新渲染購物車列表資料
      getCartList();
    })    
    .finally(() => {
      // loading 消失
      document.getElementById("preloder").style.display = "none";
    });
});

// 刪除購物車
const delAllBtn = document.querySelector(".discardAllBtn");
delAllBtn.addEventListener("click", (e) => {
  e.preventDefault();
  // loading 顯示
  document.getElementById("preloder").style.display = "block";
  axios
    .delete(
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts/`
    )
    .then((res) => {
      Swal.fire("刪除成功", "刪除全品項成功", "success");
      getCartList();
    })
    .catch((err) => {
      Swal.fire("購物車己經清空", "請再重新加入購物車", "error");
    })
    .finally(() => {
      // loading 消失
      document.getElementById("preloder").style.display = "none";
    });
});

// 送出訂單
const orderBtn = document.querySelector(".orderInfo-btn");
orderBtn.addEventListener("click", (e) => {
  e.preventDefault();  
  // console.log('你被點擊了')
  if (cartData == 0) {
    Swal.fire("購物車己清空", "請加入購物車", "error");    
    return;
  }
  const customerName = document.querySelector("#customerName").value;
  const customerPhone = document.querySelector("#customerPhone").value;
  const customerEmail = document.querySelector("#customerEmail").value;
  const customerAddress = document.querySelector("#customerAddress").value;
  const customerTradeWay = document.querySelector("#tradeWay").value;
  let errors = validate(form, constraints);
  if (errors) {
    formCheck(errors);
    Swal.fire("欄位請全部填寫", "或欄位格式錯誤", "error");
    return;
  }
  //   if (
  //     customerName == "" ||
  //     customerPhone == "" ||
  //     customerEmail == "" ||
  //     customerAddress == "" ||
  //     customerTradeWay == ""
  //   ) {
  //     Swal.fire("請勿輸入空資訊", "請填入資訊", "error");
  //     return;
  //   }
  // mail 欄位驗證
  //   if (validateEmail(customerEmail) == false) {
  //     Swal.fire("請填寫正確的Email", "格式輸入錯誤", "error");
  //     return;
  //   }

  axios
    .post(
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/orders/`,
      {
        data: {
          user: {
            name: customerName,
            tel: customerPhone,
            email: customerEmail,
            address: customerAddress,
            payment: customerTradeWay,
          },
        },
      }
    )
    .then((res) => {
      Swal.fire("訂單建立成功", "訂單己送出", "success");
      form.reset();
      getCartList();
    });
});

// 獨立對 email 驗證欄位做監聽
// const customerEmail = document.querySelector("#customerEmail");
// customerEmail.addEventListener("blur", function (e) {
//   if (validateEmail(customerEmail.value) == false) {
//     document.querySelector(`[data-message=Email]`).textContent =
//       "請填寫正確 Email 格式";
//     return;
//   } else {
//     document.querySelector(`[data-message=Email]`).textContent =
//     "";
//     return;
//   }
// });

// util js、元件
// 千分位
function toThousands(x) {
  let parts = x.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
}

// mail欄位驗證
// function validateEmail(mail) {
//   if (
//     /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(
//       mail
//     )
//   ) {
//     return true;
//   }
//   return false;
// }
