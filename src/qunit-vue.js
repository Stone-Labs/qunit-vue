QUnit.MOCK_VALUES = {
  String: "Some string",
  Number: 100500,
  Date: '11/09/2017'
}

/**
 * Creates a component with some name and defined attributes and pass some data to it
 * It will appear in assert.vueComponent field
 * @param name - a name of your component
 * @param attributes - a string with attributes 
 * @param attributes - an object with values for properties
 */

QUnit.assert.addComponent = function(name, attributes, data) {
  var done = this.async();
  this.componentName = name;
  this.$component = $("<div id='test_component'>");
  this.component.append("<" + name + " " + attributes + ">");
  $(document.body).append(this.component);
  this.vue = new Vue({
    el: '#test_component',
    data: data,
    ready: function() {
      done();
    }
  });
  this.vueComponent = this.vue.$children[0];
};

/**
 * Removes created component from page
 */

QUnit.assert.removeComponent = function() {
  this.component.remove();
}


/**
 * Checks if component has been replaced with its template
 */

QUnit.assert.componentRendered = function() {
  this.ok($(this.componentName).length == 0, "Component rendered successfully");
};


/**
 * Checks a property binding between some Vue and component.
 * @param field - a name of field
 * @param factory - a function that returns a new value for a chosen field
 */

QUnit.assert.checkProperty = function(field, factory) {
  var self = this;
  var value = factory();
  this.vue.$set(field, value);
  this.setTimeout(function() {
    self.ok(deepCompare(self.vueComponent.$get(field), value), "Field binded");
  })
};

/**
 * Checks an array binding between array property and template
 * @param field - a name of array property
 * @param parentSelector - a selector for parent element (should not appear on page after adding new elements to array)
 * @param childSelector - a selector for child elements (should appear on page)
 * @param factory - a function that returns a new value for the chosen field
 */

QUnit.assert.checkArrayBinding = function(field, parentSelector, childSelector, factory) {
  var array = this.vueComponent.$get(field);
  var self = this;
  var childrenLength = this.component.find(childSelector).length;
  var parentsLength = this.component.find(parentSelector).length;
  array.push(factory());
  this.setTimeout(function() {
    self.ok(self.component.find(childSelector).length > childrenLength, "Array binded successfully");
    self.ok(self.component.find(parentSelector).length == parentsLength, "There is only one body");
  })
}

/**
 * Checks a binding between component property and template
 * @param field - a name of the property
 * @param type - a type of the property
 * @param convert - optional, a function to prepare value previously
 */

QUnit.assert.checkBinding = function(field, type, convert) {
  convert = convert || function(value) {return value;} 
  this.vueComponent.$set(field, QUnit.MOCK_VALUES[type.name]);
  this.componentContains(convert(QUnit.MOCK_VALUES[type.name]));
}

/**
 * Checks a presence of some string in the template
 */

QUnit.assert.componentContains = function(string) {
  var self = this;
  this.setTimeout(function() {
    self.ok(self.component.html().contains(string), "Component contains string " + string);
  });
  
}

/**
 * Checks an absence of some string in the template
 */

QUnit.assert.componentNotContains = function(string) {
  var self = this;
  this.setTimeout(function() {
    self.ok(!self.component.html().contains(string), "Component don't contain string " + string);
  }); 
}

/**
 * Finds a child with index in the component
 * @param child - a name of child
 * @param index - a position of child in the component
 * @return child with index in the component
 */

QUnit.assert.findChild = function(child, index) {
  index = index || 0;
  var properChildren = this.vueComponent.$children.filter(function(vueChild) {
    return vueChild.constructor == Vue.component(child)
  });
  return properChildren[index];
}

/**
 * Checks a presence of some child in a component
 * @param child - a name of a child
 */

QUnit.assert.containsChild = function(child) {
  self.ok(this.findChild(child), "Component contains child " + child);  
}

/**
 * Checks a property binding between the component and its child
 * @param child - a name of child
 * @param parentField - a name of field in component
 * @param childField - a name of field in child
 * @param factory - a function that returns a new value for the chosen field
 */

QUnit.assert.checkChildBinding = function(child, parentField, childField, factory) {
  var child = this.findChild(child);
  var self = this;
  var value = factory();
  this.vueComponent.$set(parentField, value);
  this.setTimeout(function() {
    self.ok(deepCompare(child.$get(childField), value), "Child field binded");
  }, 300);
}

/**
 * Checks a property binding between some input in the child and the parent
 * @param child - a name of child
 * @param parentField - a name of field in component
 * @param childField - a name of field in child
 * @param factory - a function that returns a new value for the chosen field
 */

QUnit.assert.checkReverseChildBinding = function(child, parentField, childField, factory) {
  var child = this.findChild(child);
  var self = this;
  var value = factory();
  child.$set(childField, value);
  this.setTimeout(function() {
    self.ok(deepCompare(self.vueComponent.$get(parentField), value), "Child field binded");
  }, 300);
}

/**
 * Checks a binding between radio or checkbox input in template and component property
 * @param field - a name of enum field
 * @param values - an array with enum values
 */

QUnit.assert.checkReverseEnumBinding = function(field, values) {
  for(var i = 0; i < values.length; i++) {
    this.component.find("input[value=" + values[i] +"]").trigger('click');
    ok(this.vueComponent.$get(field).includes(values[i]), values[i] + " binded successfully")
  }
}

/**
 * Checks a binding between selector in template and component property
 * @param field - a name of enum field
 * @param selector - a selector for needed <select> element
 * @param values - an array with enum values
 */

QUnit.assert.checkReverseSelectBinding = function(field, selector, values) {
  for(var i = 0; i < values.length; i++) {
    this.component.find(selector).val(values[i])[0].dispatchEvent(new Event("change"))
    ok(this.vueComponent.$get(field) == values[i], values[i] + " binded successfully")
  }
};

/**
 * Checks a binding between input in template and component property
 * @param field - a name of enum field
 * @param selector - a selector for needed <input> element
 * @param type - a type of value
 */

QUnit.assert.checkReverseBinding = function(field, selector, type) {
  this.component.find(selector).val(QUnit.MOCK_VALUES[type.name]).trigger('input');
  ok(this.vueComponent.$get(field) == QUnit.MOCK_VALUES[type.name], "Field binded successfully");
}

/**
 * Checks an event received from component
 * @param event - a name of event
 * @param action - an action to emit event
 * @param argumentsCheck - some function to check event arguments
 */

QUnit.assert.checkEvent = function(event, action, argumentsCheck) {
  var self = this;
  this.vue.$on(event, function() {
    self.lastCalledEvent = event;
    self.arguments = arguments;
  });
  action();
  this.setTimeout(function() {
    ok(self.lastCalledEvent == event, "Event emitted");
    if (argumentsCheck)
      argumentsCheck.apply(this, self.arguments);
  });
}

/**
 * Checks actions after some event
 * @param event - a name of event
 * @param condition - a function to check actions after event
 */

QUnit.assert.checkActionAfterEvent = function(event, condition) {
  var self = this;
  this.vue.$broadcast(event);
  this.setTimeout(condition);
}

/**
 * Checks an event absence after some actions
 * @param event - a name of event
 * @param action - an action to emit event
 */

QUnit.assert.checkNoEvent = function(event, action) {
  var self = this;
  this.vue.$on(event, function() {
    self.lastCalledEvent = event;
  });
  action();
  this.setTimeout(function() {
    ok(self.lastCalledEvent != event, "Event not emitted");
  });
}

/**
 * Checks component nodes
 * @param condition - a function to check some component attributes or something else.
 */

QUnit.assert.checkComponentNodes = function(condition) {
  var self = this;
  this.setTimeout(function() {
    self.ok(condition(self.component), "Component condition returns true");
  });
}

QUnit.assert.setTimeout = function(callback, time) {
  time = time || 300;
  var done = this.async();
  setTimeout(function() {
    callback();
    done();
  }, time);
}

String.prototype.contains = function(substring) {
  return (this.indexOf(substring) != -1)
};

String.prototype.includes = function(substring) {
  return this.contains(substring);
};

Number.prototype.includes = function(substring) {
  return this.toString(10).contains(substring);
};