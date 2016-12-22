var Analogy = function(graph) {
  this.selectedNode = null;
  this.active = false;
  this.graph = graph;

  this.searchBox = new Awesomplete($('.node-search-box-analogy')[0], {
    autoFirst: true,
    minChars: 0,
    maxItems: 20,
  	list: this.graph.getNodeLabels(),
  });

  this.bindEvents();
};

Analogy.prototype.bindEvents = function() {
  var self = this;

  $('.story-info-header button.analogy').click(this.toggle.bind(this));
  $('.node-search-box-analogy')
    .on('click', function() {
      $(this).val('');
    })
    .on('blur', function() {
      $(this).val(self.selectedNode ? self.selectedNode.label : '');
    })
    .on('awesomplete-selectcomplete', function() {
      var node = self.graph.getNodeFromLabel($(this).val());
      self.selectNode(node);
    });
}

Analogy.prototype.toggle = function() {
  if(this.active) this.hide();
  else this.show();
}

Analogy.prototype.show = function() {
  $('.node-search.analogy').show();
  this.active = true;
}

Analogy.prototype.hide = function() {
  $('.node-search.analogy').hide();
  this.active = false;
}

Analogy.prototype.selectNode = function(node) {
  var sourceNode = this.graph.getNodeFromLabel($('.node-search-box').val());

}
