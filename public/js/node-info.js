var NodeInfo = function(node, edges, graph) {
  this.node = node;
  this.edges = edges;
  this.graph = graph;
};

NodeInfo.prototype.render = function() {
  this.$el = $('.node-info');
  this.$el.find('[data-field]').empty();

  var $description = this.$el.find('.description'),
      $incoming = this.$el.find('.incoming ul'),
      $outgoing = this.$el.find('.outgoing ul');

  var onNodeClick = function(node) {
    document.dispatchEvent(new CustomEvent('rellink:node-select', { detail: node }));
    this.graph.panCameraTo(node.uri);
  }.bind(this);

  var incomings = [],
      outgoings = [];

  this.edges.forEach(function(edge) {
    if(edge.t == this.node.uri) incomings.push(edge);
    else outgoings.push(edge);
  }.bind(this));

  incomings
    .sort(function(e1, e2) {
      return this.graph.getNodeFromUri(e1.s).label < this.graph.getNodeFromUri(e2.s).label ? -1 : 1;
    }.bind(this))
    .forEach(function(edge) {
      $incoming.append(
        $('<li></li>')
          .text(this.graph.getNodeFromUri(edge.s).label)
          .click(onNodeClick.bind(this, this.graph.getNodeFromUri(edge.s)))
      );
    }.bind(this));

  outgoings
    .sort(function(e1, e2) {
      return this.graph.getNodeFromUri(e1.t).label < this.graph.getNodeFromUri(e2.t).label ? -1 : 1;
    }.bind(this))
    .forEach(function(edge) {
      $outgoing.append(
        $('<li></li>')
          .text(this.graph.getNodeFromUri(edge.t).label)
          .click(onNodeClick.bind(this, this.graph.getNodeFromUri(edge.t)))
      );
    }.bind(this));

  if(this.node.description) {
    $description.text(this.node.description);
  } else {
    $description.append($('<span class="no-description">No description for this node</span>'));
  }

  this.$el.find('.incoming-amount').text(incomings.length);
  this.$el.find('.outgoing-amount').text(outgoings.length);

  this.$el.show();
}
