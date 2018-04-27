Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    layout: 'fit',
    
    launch: function() {
        this.setLoading(true);
        var context = this.getContext(),
            user = context.getUser(),
            basePath = Rally.environment.getServer().getBaseUrl();

        Ext.Ajax.request({
            url: basePath + '/apps/pigeon/api/v2/watch',
            method: 'GET',
            params: {
                UserUUID: user._refObjectUUID
            },
            success: function(response) {
                var results = JSON.parse(response.responseText).Results;
                this._loadArtifacts(results).then({
                    success: this._displayArtifacts,
                    scope: this
                });
            },
            failure: function(response) {
                this.setLoading(false);
                Rally.ui.notify.Notifier.showError('An error occurred while loading your watches.');
                console.error(response);
            },
            scope: this
        });    
    },

    _loadArtifacts: function(results) {
        return Rally.data.ModelFactory.getModel({
            type: 'artifact'
        }).then({
            success: function(artifactModel) {
                var url = Rally.environment.getServer().getWsapiUrl() + '/artifact';
                artifactModel.setProxy({ type: 'rallywsapiproxy', reader: { type: 'rallywsapireader', root: 'Artifact' }, url: url});
                var uuids = _.pluck(results, 'ArtifactUUID');
                return Ext.create('Rally.data.wsapi.Store', {
                    model: artifactModel,
                    context: {
                        project: null,
                        workspace: this.getContext().getWorkspaceRef()
                    },
                    filters: [{ property: 'ObjectUUID', operator: 'in', value: uuids }]
                }).load().then({
                    success: function(records) {
                        return {
                            watches: results,
                            artifacts: records
                        };
                    }
                });
            },
            scope: this
        });
    },

    _displayArtifacts: function(data) {
      var artifactsByUUID = _.indexBy(data.artifacts, function(artifact) { return artifact.get('_refObjectUUID');});
      var watchesByArtifactUUID = _.indexBy(data.watches, 'ArtifactUUID');
      var gridData = _.map(data.watches, function(watch) {

      });
      debugger;
  }
});
