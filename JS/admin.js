let orderData = [];
const orderList = document.querySelector('.js-orderList');
function init(){
    getOrderList();
}
init();
function renderC3(){
    //物件資料收集
    let total = {};
    orderData.forEach(function(item){
        item.products.forEach(function(productItem){
            if(total[productItem.category] === undefined){
                total[productItem.category] = productItem.price * productItem.quantity;
            }else{
                total[productItem.category] += productItem.price * productItem.quantity;
            }
        })
    })
    console.log(total);
    // 做出資料關聯
    let categoryAry = Object.keys(total);
    let newData = [];
    categoryAry.forEach(function(item){
        let ary = [];
        ary.push(item);
        ary.push(total[item]);
        newData.push(ary);
    })
    console.log(newData);
    let chart = c3.generate({
        bindto: '#chart', // HTML 元素綁定
        data: {
            type: "pie",
            columns: newData,
        },
    });
}
function getOrderList(){
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,{
        headers:{
            'authorization':token,
        }
    }).then(function(response){
        orderData=response.data.orders;
        console.log(orderData);
        let str = "";
        orderData.forEach(function(item){
            // 組時間字串
            const timeStamp = new Date(item.createdAt * 1000);
            const orderTime = `${timeStamp.getFullYear()}/${timeStamp.getMonth()}/${timeStamp.getDate()}`;
            // 組產品字串
            let productStr = "";
            item.products.forEach(function(productItem){
                productStr+=`<p>${productItem.title}x${productItem.quantity}</p>`
            });
            // 判斷訂單處理狀態
            let  orderStatus = "";
            if(item.paid === true){
                orderStatus = "已處理";
            }else{
                orderStatus = "未處理";
            }
            // 組訂單字串
            str += `<tr>
            <td>${item.id}</td>
            <td>
                <p>${item.user.name}</p>
                <p>${item.user.tel}</p>
            </td>
            <td>${item.user.address}</td>
            <td>${item.user.email}</td>
            <td>
                ${productStr}
            </td>
            <td>${orderTime}</td>
            <td class="js-orderStatus">
                <a href="#" class="orderStatus" data-status="${item.paid}" data-id="${item.id}">${orderStatus}</a>
            </td>
            <td>
                <input type="button" class="delSingleOrder-Btn js-orderDelete" data-id="${item.id}" value="刪除">
            </td>
            </tr>`
        });
        orderList.innerHTML = str;
        renderC3();
    })
}

orderList.addEventListener('click',function(e){
    e.preventDefault();
    let status = e.target.getAttribute("data-status");
    let id = e.target.getAttribute("data-id");
    const targetClass = e.target.getAttribute("class");
    if(targetClass == "delSingleOrder-Btn js-orderDelete"){
        deleteOrder(id);
        return;
    }
    if(targetClass == "orderStatus"){
        changeOrderStatus(status,id)
        return;
    }
})

function changeOrderStatus(status,id){    
    console.log(status,id);
    let newStatus;
    if(status === true){
        newStatus = false;
    }else{
        newStatus = true;
    }
    axios.put(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,{
        "data": {
            "id": id,
            "paid": newStatus
        }
    },
    {
        headers:{
            'authorization':token,
        }
    }).then(function(response){
        alert("更改成功");
        getOrderList();
    })
}

function deleteOrder(id){
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders/${id}`,{
        headers:{
            'authorization':token,
        }
    }).then(function(response){
        alert('刪除成功');
        getOrderList();
    })
}

// 刪除全部訂單
const discardAllBtn = document.querySelector('.discardAllBtn');
discardAllBtn.addEventListener('click',function(e){
    e.preventDefault();
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,{
        headers:{
            'authorization':token,
        }
    }).then(function(response){
        alert('刪除全部訂單成功');
        getOrderList();
    })
})