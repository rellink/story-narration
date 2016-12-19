var NodeInfo = function(node, edges) {
  this.node = node;
  this.edges = edges;
};

NodeInfo.prototype.render = function() {
  console.log(this.node, this.edges);
}
