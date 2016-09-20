module("Vue component test", {
  beforeEach: function(assert) {
    assert.addComponent("asset_details", ":asset=asset", {
      asset: {}
    });
  },
  afterEach: function(assert) {
    assert.removeComponent();
  }
});

test("Create component", function(assert) {
  assert.componentRendered();
});

test("Bind asset property", function(assert) {
  assert.checkProperty("asset", Asset);
});

test("Bind name to component", function(assert) {
  assert.checkBinding("asset.name", String);
});

test("Bind marked description to component", function(assert) {
  assert.vueComponent.asset.description = "**strong**";
  assert.componentContains("<strong>strong</strong>");
});

test("Bind counter component", function(assert) {
  assert.containsChild("counter");
});

test("Bind days left to counter component", function(assert) {
  assert.checkChildBinding("counter", "asset.days_left", "days_left", Number);
});

test("Bind notifications in template", function(assert) {
  assert.checkArrayBinding("notifications", ".timeline", ".tl-entry", Object);
});