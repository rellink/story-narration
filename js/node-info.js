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
      $outgoing = this.$el.find('.outgoing ul'),
      nIncoming = 0,
      nOutgoing = 0;

  var onNodeClick = function(node) {
    document.dispatchEvent(new CustomEvent('rellink:node-select', { detail: node }));
    this.graph.panCameraTo(node.uri);
  }.bind(this);

  this.edges.forEach(function(edge) {
    if(edge.t == this.node.uri) {
      nIncoming++;
      $incoming.append(
        $('<li></li>')
          .text(this.graph.getNodeFromUri(edge.s).label)
          .click(onNodeClick.bind(this, this.graph.getNodeFromUri(edge.s)))
      );
    } else {
      nOutgoing++;
      $outgoing.append(
        $('<li></li>')
          .text(this.graph.getNodeFromUri(edge.t).label)
          .click(onNodeClick.bind(this, this.graph.getNodeFromUri(edge.t)))
      );
    }
  }.bind(this));

  if(this.node.description) {
    $description.text(this.node.description);
  } else {
    $description.append($('<span class="no-description">No description for this node</span>'));
  }

  this.$el.find('.incoming-amount').text(nIncoming);
  this.$el.find('.outgoing-amount').text(nOutgoing);

  this.$el.show();
}
