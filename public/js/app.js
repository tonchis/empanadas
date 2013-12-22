var template = document.getElementById("pair-template");
var orders = document.getElementById("orders");
var addOrder = document.getElementById("add-order");
var finish = document.getElementById("finish");
var finalOrder = document.getElementById("final-order");
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
    for(var property in flavours) {
      var option = document.createElement("option");
      option.setAttribute("value", property);
      option.innerHTML = flavours[property];
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

function addOrders() {
  computedOrder = {};
  for(var i = 0; i < orders.getElementsByTagName("ul").length; i++) {
    var order = orders.getElementsByTagName("ul")[i];

    for(var j = 0; j < order.getElementsByTagName("li").length; j++) {
      var pair = order.getElementsByTagName("li")[j];
      var amount = parseInt(pair.firstElementChild.value);
      var flavour = pair.lastElementChild.value;

      if(!isNaN(amount)) {
        if(computedOrder[flavour] === undefined) {
          computedOrder[flavour] = 0;
        }
        computedOrder[flavour] += amount;
      }
    }
  }

  return computedOrder;
}

finish.addEventListener("click", function() {
  var computedOrder = addOrders();

  finalOrder.innerHTML = "";
  for(property in computedOrder) {
    li = document.createElement("li");
    li.innerHTML = computedOrder[property] + " " + flavours[property];
    finalOrder.appendChild(li);
  }
});

