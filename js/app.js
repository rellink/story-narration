var App = function() {};

App.start = function() {

};

App.selectTopic = function(name, url, type) {
  App.hideGetStarted();
  App.showLoading();

  App.story = new Story(name, new Graph());
  App.story.load(url, type, function() {
    App.story.graph.render();
    App.story.graph.forceLayout(function() {
      App.hideLoading();
      App.hideOverlay();
    });
  });
};

App.hideGetStarted = function() {
  $('main.overlay .get-started').hide();
}

App.hideOverlay = function() {
  $('main.overlay').hide();
}

App.showLoading = function() {
  $('main.overlay .loading').css({ display: 'flex' });
}

App.hideLoading = function() {
  $('main.overlay .loading').hide();
}

// Export
window.App = App;
