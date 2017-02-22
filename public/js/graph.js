var Graph = function() {
  this.data = {
    nodes: [],
    edges: []
  };
  this.mode = 'all';
  this.activeNode = null; // Selected node (to highlight)
  this.highlight = {
    disableHover: false,
    hideNodes: {}, // Show by default
    showEdges: {}, // Hide by default,
    edgeColor: {}
  };
  this.labelDict = {};
  this.uriDict = {};
  this.sigma = new sigma({
    renderer: {
      container: document.getElementById('graph'),
      type: 'canvas'
    },
    settings: {
      defaultNodeType: 'fast',
      defaultEdgeType: 'fast',
      hideEdgesOnMove: false,
      doubleClickEnabled: false,
      doubleClickZoomingRatio: 1,
      animationsTime: 500,
      defaultEdgeColor: '#44A8FF',
    }
  });
};

// github.com/Adebis/NarrativeBackendRPI

Graph.prototype.load = function(url, type, onDone) {
  console.log(url, type);
  switch(type) {
    case 'json': return this.loadJSON(url).done(onDone);
    case 'aimind': return this.loadAIMind(url).done(onDone);
    default: return this.loadJSON(url).done(onDone);
  }
}

Graph.prototype.loadJSON = function(url) {
  return $.getJSON(url, {}, this.importJSON.bind(this));
}

Graph.prototype.loadAIMind = function(url) {
  return $.get(url, {}, this.importAIMind.bind(this));
}

Graph.prototype.render = function() {
  this.updateHighlight();
  this.sigma.refresh();
}

Graph.prototype.getEdgeId = function(sourceUri, targetUri) {
  return sourceUri + ' ' + targetUri;
}

Graph.prototype.getNodeLabels = function() {
  return this.data.nodes.map(function(node) {
    return node.label;
  });
}

Graph.prototype.getEdgesFromURI = function(uri) {
  return this.data.edges.filter(function(edge) {
    return edge.s == uri || edge.t == uri;
  });
}

Graph.prototype.getNodeFromLabel = function(label) {
  return this.labelDict[label];
}

Graph.prototype.getNodeFromUri = function(uri) {
  return this.uriDict[uri];
}

Graph.prototype.importJSON = function(data) {
  this.data = data;

  // Calculate weights of nodes
  var weight = {},
      maxWeight = 0;
  var increaseWeight = function(uri) {
    weight[uri] = weight[uri] ? weight[uri]+1 : 1;
  }
  // Map weights
  data.edges.forEach(function(edge){
    increaseWeight(edge.s);
    increaseWeight(edge.t);
  });
  // Normalize weights
  Object.keys(weight).map(function(uri) {
    weight[uri] = normalizeWeight(weight[uri]);
    maxWeight = Math.max(weight[uri], maxWeight);
  });

  // Populate nodes
  data.nodes.forEach(function(node){
    this.sigma.graph.addNode({
      // Main attributes:
      id: node.uri, // ****** HACK!!!! *****
      label: node.label || node.uri.split('/').pop(),
      x: Math.random(),
      y: Math.random(),
      size: weight[node.uri],
      // Display attributes:
      color: getColorFromScale(weight[node.uri]/maxWeight)
    });
  }.bind(this));

  // Populate edges
  data.edges.forEach(function(edge){
    this.sigma.graph.addEdge({
      id: this.getEdgeId(edge.s, edge.t),
      source: edge.s,
      target: edge.t,
      label: edge.r,
      color: '#44A8FF',
      hidden: true
    });
  }.bind(this));

  // Populate label dict
  data.nodes.forEach(function(node) {
    if(!node.label) {
      node.label = node.uri.split('/').pop();
    }
    this.labelDict[node.label] = node;
    this.uriDict[node.uri] = node;
  }.bind(this));

  // Bind events
  this.bindEvents();
}

Graph.prototype.importAIMind = function(data) {
  // Turn data into JSON
  var json = {};

  var root = data.children[0].getElementsByTagName('Root')[0].getAttribute('id');
  var features = data.children[0].getElementsByTagName('Feature');

  var nodes = [], edges = [], checkNode = {};
  // Populate nodes
  Array.from(features).forEach(function(feature) {
    var description = '';
    if(feature.getElementsByTagName('speak').length) {
      description = feature.getElementsByTagName('speak')[0].innerHTML;
    }
    nodes.push({
      uri: feature.getAttribute('id'),
      label: feature.getAttribute('data'),
      description: description,
      properties: {}
    });
    checkNode[feature.getAttribute('id')] = true;
  });
  // Populate edges
  Array.from(features).forEach(function(feature) {
    Array.from(feature.getElementsByTagName('neighbor')).forEach(function(neighbor) {
      if(checkNode[feature.getAttribute('id')] &&
         checkNode[neighbor.getAttribute('dest')] ) {
        edges.push({
          s: feature.getAttribute('id'),
          t: neighbor.getAttribute('dest'),
          r: neighbor.getAttribute('relationship')
        });
      }
    });
  });

  this.importJSON({ nodes:nodes, edges:edges });
}

Graph.prototype.forceLayout = function(onDone) {
  this.sigma.startForceAtlas2();
  setTimeout(function(){
    this.sigma.stopForceAtlas2();
    onDone();
  }.bind(this), 3000);
}

Graph.prototype.updateHighlight = function() {
  this.sigma.graph.nodes().forEach(function(n) {
    if (this.highlight.hideNodes[n.id]) {
      n.hidden = true;
    } else {
      n.hidden = false;
    }
  }.bind(this));

  this.sigma.graph.edges().forEach(function(e) {
    if (this.highlight.showEdges[e.id]) {
      e.hidden = false;
      e.color = this.highlight.edgeColor[e.id] || this.sigma.settings('defaultEdgeColor');
    } else {
      e.hidden = true;
    }
  }.bind(this));
}

Graph.prototype.highlightNodeNighbors = function(nodeId) {
  var toShowNodes = {},
      toShowEdges = {};

  this.sigma.graph.edges().forEach(function(e) {
    if (e.source == nodeId || e.target == nodeId) {
      toShowEdges[e.id] = true;
      toShowNodes[e.source] = true;
      toShowNodes[e.target] = true;
    }
  });

  this.highlight.showEdges = toShowEdges;
  this.highlight.hideNodes = this.sigma.graph.nodes().reduce(function(c, n) {
    if(!toShowNodes[n.id]) c[n.id] = true;
    return c;
  }, {});
}

/* param: an array of { source: sourceUri, target: targetUri }*/
Graph.prototype.highlightEdges = function(edges) {
  // Select edges to show
  var toShowEdges = {};
  edges.forEach(function(e) {
    toShowEdges[this.getEdgeId(e.source, e.target)] = true;
    this.highlight.edgeColor[this.getEdgeId(e.source, e.target)] = e.color;
  }.bind(this));
  this.highlight.showEdges = toShowEdges;
}

Graph.prototype.resetHighlight = function() {
  this.highlight.hideNodes = {};
  this.highlight.showEdges = {};
}

Graph.prototype.panCameraTo = function(nodeId) {
  var node = this.sigma.graph.nodes(nodeId);

  sigma.misc.animation.camera(
    this.sigma.camera,
    {
      x: node[this.sigma.camera.readPrefix + 'x'],
      y: node[this.sigma.camera.readPrefix + 'y'],
      ratio: node[this.sigma.camera.readPrefix + 'size']/10
    },
    { duration: this.sigma.settings('animationsTime') }
  );
}

Graph.prototype.updateNodeProperty = function(nodeId, prop) {
  var node = this.sigma.graph.nodes(nodeId);
  Object.keys(prop).map(function(k) {
    node[k] = prop[k];
  });
}

Graph.prototype.bindEvents = function() {
  var refresh = function() {
    rendering = true;
    this.render();
  }.bind(this);

  this.sigma.bind('clickNode', function(e) {
    document.dispatchEvent(
      new CustomEvent('rellink:node-select', {
        detail: this.uriDict[e.data.node.id]
      })
    );
  }.bind(this));
  //
  // this.sigma.bind('doubleClickNode', function(e) {
  //   var nodeId = e.data.node.id;
  //   this.activeNode = nodeId;
  //   this.highlightNodeNighbors(nodeId);
  //
  //   refresh();
  // }.bind(this));
  //
  // this.sigma.bind('clickStage', function(e) {
  //   this.activeNode = null;
  //   this.resetHighlight();
  //
  //   refresh();
  // }.bind(this));
  //
  // this.sigma.bind('overNode', function(e) {
  //   if(this.activeNode) return;
  //
  //   var nodeId = e.data.node.id;
  //   this.highlightNodeNighbors(nodeId);
  //
  //   refresh();
  // }.bind(this));
  //
  // this.sigma.bind('outNode', function(e) {
  //   if(this.activeNode) return;
  //   if(rendering) return; // Handle when graph are being rendered
  //
  //   this.resetHighlight();
  //
  //   refresh();
  // }.bind(this));

  var rendering = false;
  this.sigma.renderers[0].bind('render', function(e) {
    rendering = false;
  })
}

/* Helper functions */

function normalizeWeight(weight) {
  return 1 + Math.log(weight);
}

function getColorFromScale(value) {
	var h = (1.0 - value) * 240
	return tinycolor("hsl(" + h + ", 100%, 50%)").toHexString();
}

// Export
window.Graph = Graph;
