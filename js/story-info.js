var StoryInfo = function(name, graph) {
  this.name = name;
  this.graph = graph;
  this.selectedNode = null;

  document.addEventListener('rellink:node-select', function(e) {
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
      $(this).val(self.selectedNode ? self.selectedNode.label : '');
    })
    .on('awesomplete-selectcomplete', function() {
      var node = self.graph.getNodeFromLabel($(this).val());
      document.dispatchEvent(new CustomEvent('rellink:node-select', { detail: node }));
      self.graph.panCameraTo(node.uri);
    });

  this.$el.fadeIn();
}

StoryInfo.prototype.selectNode = function(node) {
  var edges = this.graph.getEdgesFromURI(node.uri);
  this.selectedNodeInfo = new NodeInfo(node, edges, this.graph);
  this.selectedNodeInfo.render();

  /* Highlight node: render as star */
  if(this.selectedNode) {
    this.graph.updateNodeProperty(this.selectedNode.uri, {
      type: 'cicle' ,
      borderColor: undefined
    });
  }
  this.graph.updateNodeProperty(node.uri, {
    type: 'star' ,
    borderColor: '#777777'
  });
  this.graph.render();

  this.selectedNode = node;
};
