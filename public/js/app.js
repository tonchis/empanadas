var template = document.getElementById("pair-template");
var orders = document.getElementById("orders");
var newOrder = document.getElementById("new-order");
var finish = document.getElementById("finish");
var finalOrder = document.getElementById("final-order");
var li;
var ul;

function copyTemplateInto(element) {
  for(var i = 0; i < template.children.length; i++) {
    element.appendChild(template.children[i].cloneNode(true));
  }
}

function addPair(order) {
  li = document.createElement("li");
  copyTemplateInto(li);
  order.appendChild(li);

  var input = li.getElementsByTagName("input")[0];
  var addPairOnFocus = function() {
    addPair(order);
    input.removeEventListener("focusin", addPairOnFocus);
  };
  input.addEventListener("focusin", addPairOnFocus);
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

newOrder.addEventListener("click", function() {
  var currentId = parseInt(orders.lastElementChild.getAttribute("data-id")) + 1;
  ul = document.createElement("ul");
  ul.setAttribute("data-id", currentId);
  ul.setAttribute("id", "order-" + currentId);
  addPair(ul);
  orders.appendChild(document.createElement("hr"));
  orders.appendChild(ul);
});

function addOrders() {
  var computedOrder = {total: 0};
  for(var i = 0; i < orders.getElementsByTagName("ul").length; i++) {
    var order = orders.getElementsByTagName("ul")[i];

    for(var j = 0; j < order.getElementsByTagName("li").length; j++) {
      var pair = order.getElementsByTagName("li")[j];
      var amount = parseInt(pair.getElementsByTagName("input")[0].value);
      var flavour = pair.getElementsByTagName("select")[0].value;

      if(!isNaN(amount)) {
        if(computedOrder[flavour] === undefined) {
          computedOrder[flavour] = 0;
        }
        computedOrder[flavour] += amount;
        computedOrder.total += amount;
      }
    }
  }

  return computedOrder;
}

finish.addEventListener("click", function() {
  var computedOrder = addOrders();

  finalOrder.innerHTML = "";
  finalOrder.appendChild(document.createElement("ul"));
  for(property in computedOrder) {
    if(property !== "total") {
      li = document.createElement("li");
      li.innerHTML = computedOrder[property] + " " + flavours[property];
      finalOrder.lastElementChild.appendChild(li);
    }
  }

  var span = document.createElement("span");
  span.innerHTML = "Total: " + computedOrder.total;
  span.innerHTML += " (" + (computedOrder.total / 12).toFixed(1) + " docenas)"
  finalOrder.appendChild(span);
  finalOrder.parentNode.insertBefore(document.createElement("hr"), finalOrder.nextSibling);
});

