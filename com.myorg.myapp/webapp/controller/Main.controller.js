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
    },
    onSaveAdd:function(){
        const oModel = this.getView().getModel();

        const newProduct = {
            ID: this.byId("idInput").getValue(),
            title: this.byId("titleInput").getValue(),
            author: this.byId("authorInput").getValue(),
            stock: this.byId("stockInput").getValue(),
            price: this.byId("priceInput").getValue(),

            
        };
        const oList =oModel.bindList("/Books");
        const oContext = oList.create(newProduct);
        oContext.created().then(() => {
            MessageBox.success("Product added successfully");
            this.byId("addDialog").close();
        });
        
    }
   });
});