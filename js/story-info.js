var StoryInfo = function(name, graph) {
  this.name = name;
  this.graph = graph;
  this.selectedNode = '';

  document.addEventListener('graph:node-select', function(e) {
    this.selectNode(e.detail);
    this.$el.find('.node-search-box').trigger('blur');
  }.bind(this));
};

StoryInfo.prototype.render = function() {
  this.$el = $('.story-info');
  this.$el.find('.story-name').text(this.name);

  this.searchBox = new Awesomplete(this.$el.find('.node-search-box')[0], {
    autoFirst: true,
    minChars: 0,
    maxItems: 20,
  	list: this.graph.getNodeLabels(),
  });

  var self = this;

  this.$el.find('.node-search-box')
    .on('click', function() {
      $(this).val('');
    })
    .on('blur', function() {
      $(this).val(self.selectedNode.label);
    })
    .on('awesomplete-selectcomplete', function() {
      self.selectNodeFromLabel($(this).val());
    });

  this.$el.fadeIn();
}

StoryInfo.prototype.selectNodeFromLabel = function(nodeLabel) {
  var node = this.graph.getNodeFromLabel(nodeLabel);
  this.selectNode(node.uri);
}

StoryInfo.prototype.selectNode = function(nodeUri) {
  var node = this.graph.getNodeFromUri(nodeUri);
  var edges = this.graph.getEdgesFromURI(nodeUri);
  this.selectedNodeInfo = new NodeInfo(node, edges);
  this.selectedNodeInfo.render();
  this.selectedNode = node;
};
