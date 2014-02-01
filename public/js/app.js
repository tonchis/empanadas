var pairTemplate = document.getElementById("pair-template");
var orders = document.getElementById("orders");
var newOrder = document.getElementById("new-order");
var finish = document.getElementById("finish");
var finalOrder = document.getElementById("final-order");
var orderTemplate = document.getElementById("order-template");
var li;
var ul;
var promise;
var request;
var flavours;

function HTTPromise(options) {
  var self = this;

  this.method = options.method;
  this.url = options.url;
  this.data = options.data;
  this.headers = options.headers;
  this.resolveFunction = options.resolve;
  this.rejectFunction = options.reject;

  this.req = new XMLHttpRequest();
  this.promise = new Promise(function(resolve, reject) {
    self.req.open(self.method, self.url);

    for(var header in self.headers) {
      self.req.setRequestHeader(header, self.headers[header]);
    }

    self.req.onload = function() {
      if(self.req.status === 200) {
        resolve(self.req.responseText);
      } else {
        reject(self.req.responseText);
      }
    }

    self.req.onerror = function() {
      reject(JSON.parse(self.req.responseText));
    }

    self.req.send(self.data);
  });

  this.promise.then(function(data) {
    self.resolveFunction(data);
  }, function(error) {
    self.rejectFunction(error);
  }).then(undefined, function(error) {
    console.log("[HTTPromise error when resolving] " + error);
  });

  return this;
}

function copyTemplateInto(template, element) {
  for(var i = 0; i < template.children.length; i++) {
    element.appendChild(template.children[i].cloneNode(true));
  }

  return element.lastElementChild;
}

function addPair(order) {
  li = document.createElement("li");
  copyTemplateInto(pairTemplate, li);
  order.appendChild(li);

  var input = li.getElementsByTagName("input")[0];
  var addPairOnFocus = function() {
    addPair(order);
    input.removeEventListener("focusin", addPairOnFocus);
  };
  input.addEventListener("focusin", addPairOnFocus);
}

function addOrders() {
  var computedOrder = {total: 0};
  for(var i = 0; i < orders.getElementsByTagName("ul").length; i++) {
    var order = orders.getElementsByTagName("ul")[i];

    // Starting from 1 to skip the name.
    for(var j = 1; j < order.getElementsByTagName("li").length; j++) {
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

function fillFlavoursSelect(data){
  for(var property in data) {
    var option = document.createElement("option");
    option.setAttribute("value", property);
    option.innerHTML = data[property];
    pairTemplate.getElementsByTagName("select")[0].appendChild(option);
  }
}

if(window.Promise) {
  var httpromise = new HTTPromise({method: "GET", url: "/js/flavours.json", resolve: function(data) {
    flavours = JSON.parse(data)
    fillFlavoursSelect(flavours);
    ul = copyTemplateInto(orderTemplate, orders);
    addPair(ul);
  }, reject: function(error) {
    alert("I couldn't get the flavours, reload me!");
  }});
} else {
  request = new XMLHttpRequest();

  request.onload = function() {
    if(request.status === 200){
      flavours = JSON.parse(data)
      fillFlavoursSelect(flavours);
      ul = copyTemplateInto(orderTemplate, orders);
      addPair(ul);
    }
  }
  request.onerror = function() {
    alert("I couldn't get the flavours, reload me!");
  }

  request.open("GET", "/js/flavours.json");
  request.send();
}

newOrder.addEventListener("click", function() {
  var currentId = parseInt(orders.lastElementChild.getAttribute("data-order-id")) + 1;
  ul = copyTemplateInto(orderTemplate, orders);
  ul.setAttribute("data-order-id", currentId);
  addPair(ul);
});

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
});

