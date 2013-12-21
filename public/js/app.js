var template = document.getElementById("pair-template");
var orders = document.getElementById("orders");
var addOrder = document.getElementById("add-order");
var finish = document.getElementById("finish");
var li;
var ul;

function copyTemplateInto(element) {
  for(var i = 0; i < template.children.length; i++) {
    element.appendChild(template.children[i].cloneNode());
  }
}

function addPair(order) {
  li = document.createElement("li");
  copyTemplateInto(li);
  order.appendChild(li);

  var lastPair = li.getElementsByTagName("input")[0];
  var addPairOnFocus = function() {
    addPair(order);
    lastPair.removeEventListener("focusin", addPairOnFocus);
  };
  lastPair.addEventListener("focusin", addPairOnFocus);
}

var flavours;
var request = new XMLHttpRequest();
request.onreadystatechange = function() {
  if(request.readyState === 4 && request.status === 200){
    flavours = JSON.parse(request.responseText);
    for(var index in flavours) {
      var option = document.createElement("option");
      option.setAttribute("value", flavours[index].value);
      option.innerHTML = flavours[index].name;
      template.getElementsByTagName("select")[0].appendChild(option);
    }

    addPair(orders.firstElementChild);
  }
}
request.open("GET", "/js/flavours.json");
request.send();

addOrder.addEventListener("click", function() {
  var currentId = parseInt(orders.lastElementChild.getAttribute("data-id")) + 1;
  ul = document.createElement("ul");
  ul.setAttribute("data-id", currentId);
  addPair(ul);
  orders.appendChild(ul);
});

function parseOrder(orderEl) {
  var order = {};
  for(var i = 0; i < orderEl.children.length; i++) {
    var pairEl = orderEl.children[i];
    var amount = parseInt(pairEl.firstElementChild.value);
    if(pairEl.value !== NaN) {
      var flavour = pairEl.lastElementChild.value
      order[flavour] = amount;
    }
  }

  return order;
}

function addOrders() {
  var finalOrder = [];
  var parsedOrders = [];

  for(var i = 0; i < orders.children.length; i++) {
    parsedOrders.push(parseOrder(orders.children[i]));
  }

  console.log(parsedOrders);
}

finish.addEventListener("click", function() {
  addOrders();
});
