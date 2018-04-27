Ext.define('Rally.ui.menu.item.Unwatch', {
    alias: 'widget.rallyrecordmenuitemunwatch',
    extend: 'Rally.ui.menu.item.RecordMenuItem',

    config: {

        handler: function() {
            var basePath = Rally.environment.getServer().getBaseUrl();

            Ext.Ajax.request({
                url: basePath + '/apps/pigeon/api/v2/watch?ArtifactUUID=' +
                    this.record.watch.ArtifactUUID +
                    '&UserUUID=' + this.record.watch.UserUUID,
                method: 'DELETE',
                success: function() {
                    this.record.store.remove(this.record);
                    Rally.ui.notify.Notifier.show({ message: 'Work item unwatched successfully.' });
                },
                failure: function(response) {
                    Rally.ui.notify.Notifier.showError('An error occurred while unwatching.');
                    console.error(response);
                },
                scope: this
            });
        },

        text: 'Unwatch'
    }
});