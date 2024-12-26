sap.ui.define([
   "./BaseController",
   "sap/m/MessageBox",
   "sap/ui/model/odata/v4/ODataModel"
], function (BaseController, MessageBox, ODataModel) {
   "use strict";

   return BaseController.extend("com.myorg.myapp.controller.Main", {
    onInit: function () {
        const oModel = new ODataModel({
            serviceUrl: "http://localhost:4000/odata/",
            synchronizationMode: "None"
        });
        
        this.getView().setModel(oModel);
    },
    onEdit:function(){
    this.byId("editDialog").open();
    },
    onAdd:function(){  
    this.byId("addDialog").open();
    },
    onCancelAdd:function(){
    this.byId("addDialog").close();
    }
   });
});