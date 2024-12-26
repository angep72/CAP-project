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
        onEdit: function () {
            this.byId("editDialog").open();
        },
        onAdd: function () {
            this.byId("addDialog").open();
        },
        onCancelAdd: function () {
            this.byId("addDialog").close();
        },
        onSaveAdd: function () {
            const oModel = this.getView().getModel();

            const newProduct = {
                ID: this.byId("idInput").getValue(),
                title: this.byId("titleInput").getValue(),
                author: this.byId("authorInput").getValue(),
                stock: this.byId("stockInput").getValue(),
                price: this.byId("priceInput").getValue(),


            };
            const oList = oModel.bindList("/Books");
            const oContext = oList.create(newProduct);
            oContext.created().then(() => {
                MessageBox.success("Product added successfully");
                this.byId("addDialog").close();
            });

        },
        onDelete: function (oEvent) {
            const item = oEvent.getSource().getParent();
            const context = item.getBindingContext();
        
            if (!context) {
                sap.m.MessageBox.error("No context found for the selected item.");
                return;
            }
        
            sap.m.MessageBox.confirm("Are you sure you want to delete this product?", {
                actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
                onClose: function (oAction) {
                    if (oAction === sap.m.MessageBox.Action.YES) {
                        // OData v4 deletion using context.delete()
                        context.delete().then(function() {
                            sap.m.MessageBox.success("Product deleted successfully!");
                        }).catch(function(oError) {
                            sap.m.MessageBox.error("Error deleting product: " + oError.message);
                        });
                    }
                }.bind(this) // Bind to maintain controller context
            });
        }
        
        
    });
});