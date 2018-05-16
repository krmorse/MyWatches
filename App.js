Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    layout: 'fit',

    start: 1,
    pageSize: 25,
    
    launch: function() {
        this._loadWatches();
    },

    _loadWatches: function() {
        this.setLoading(true);
        var context = this.getContext(),
            user = context.getUser(),
            basePath = Rally.environment.getServer().getBaseUrl();

        Ext.Ajax.request({
            url: basePath + '/apps/pigeon/api/v2/watch',
            method: 'GET',
            params: {
                UserUUID: user._refObjectUUID,
                start: this.start,
                pagesize: this.pageSize
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
                Rally.ui.notify.Notifier.showError({ message: 'An error occurred while loading your watches.' });
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
                artifactModel.addField({ name: 'watchedOn' });
                artifactModel.setProxy({ type: 'rallywsapiproxy', reader: { type: 'rallywsapireader', root: 'Artifact' }, url: url});
                var uuids = _.pluck(results, 'ArtifactUUID');
                var store = Ext.create('Rally.data.wsapi.Store', {
                    model: artifactModel,
                    context: {
                        project: null,
                        workspace: this.getContext().getWorkspaceRef()
                    },
                    filters: [{ property: 'ObjectUUID', operator: 'in', value: uuids }]
                });

                if (results.length) {
                    return store.load().then({
                        success: function(records) {
                            var watchesByArtifactUUID = _.indexBy(results, 'ArtifactUUID');
                            _.each(records, function(record) {
                                record.watch = watchesByArtifactUUID[record.get('_refObjectUUID')];
                            });
                            return store;
                        }
                    });
                } else {
                    store.loadRawData([]);
                    return store;
                }
            },
            scope: this
        });
    },

    _displayArtifacts: function(store) {
        this.setLoading(false);
        if (this.down('rallygrid')) {
            this.down('rallygrid').destroy();
        }
        this.add({
            xtype: 'rallygrid',
            showPagingToolbar: true,
            showRowActionsColumn: true,
            sortableColumns: false,
            editable: false,
            store: store,
            pagingToolbarCfg: {
                pageSizes: [10, 25],
                comboboxConfig: {
                    value: this.pageSize
                }
            },
            columnCfgs: [
                'FormattedID',
                'Name',
                'Owner',
                {
                    dataIndex: 'watchedOn',
                    text: 'Watched On',
                    renderer: function(value, cell, record) {
                        return Rally.util.DateTime.formatWithDefault(new Date(record.watch.CreationDate));
                    }
                }
            ]
        });
    }
});
