Ext.define('Rally.ui.menu.DefaultRecordMenuFix', {
    override: 'Rally.ui.menu.DefaultRecordMenu',
    _getMenuItems: function() {
        return [{
            xtype: 'rallyrecordmenuitemunwatch',
            record: this.getRecord()
        }];
    }
});