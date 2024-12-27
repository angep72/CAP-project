sap.ui.define([
    "./BaseController",
    "sap/m/MessageBox",
    "sap/ui/model/odata/v4/ODataModel",
    "sap/m/MessageBox"
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
                this.byId("addDialog").close()
                oModel.refresh();                
            });

        },
        onDelete: function (oEvent) {
            const item = oEvent.getSource().getParent();
            const context = item.getBindingContext();
        
            if (!context) {
                sap.m.MessageBox.error("No context found for the selected item.");
                return;
            }
        
            MessageBox.confirm("Are you sure you want to delete this product?", {
                actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                onClose: function (oAction) {
                    if (oAction === MessageBox.Action.YES) {
                        // OData v4 deletion using context.delete()
                        context.delete().then(function() {
                            MessageBox.success("Product deleted successfully!");
                        }).catch(function(oError) {
                            MessageBox.error("Error deleting product: " + oError.message);
                        });
                    }
                }.bind(this) // Bind to maintain controller context
            });
        },
        onEdit: function (oEvent) {
            const button = oEvent.getSource();
            const listItem = button.getParent();
            const context = listItem.getBindingContext();
            const booksData = context.getObject()
             this._selectedBookId = booksData.ID
             const dialog = this.byId("editDialog");
             this.byId("editId").setValue(booksData.ID);
             this.byId("editTitle").setValue(booksData.title);
             this.byId("editAuthor").setValue(booksData.author);
             this.byId("editStock").setValue(booksData.stock);
             this.byId("editPrice").setValue(booksData.price);
             dialog.open();
        },
        onCancelEdit: function () {
            this.byId("editDialog").close();
        },
            onSaveEdit: function() {
                const oModel = this.getView().getModel();
            
                // Ensure the model is available
                if (!oModel) {
                    MessageBox.error("Model not found!");
                    return;
                }
            
                // Collect the data for the book
                const booksData = {
                    ID: this._selectedBookId,  // Ensure this ID is set correctly
                    title: this.byId("editTitle").getValue(),
                    author: this.byId("editAuthor").getValue(),
                    stock: this.byId("editStock").getValue(),
                    price: this.byId("editPrice").getValue(),
                };
            
                // Bind the list and get the context of the specific book
                const oList = oModel.bindList("/Books");
                
                // Check if the list and context are valid
                const sPath = "/Books(" + booksData.ID + ")";
                const oContext = oList.getContext(sPath);
            
                if (oContext) {
                    // If oContext is valid, proceed with the update
                    oContext.update(booksData).then(() => {
                        // On successful update
                        MessageBox.success("Product updated successfully");
                        this.byId("editDialog").close();
                        oModel.refresh();  // Refresh the model to reflect the changes
                    }).catch((error) => {
                        // Handle update failure
                        MessageBox.error("Update failed: " + (error.message || error));
                    });
                } else {
                    // Handle case when context is not found
                    MessageBox.error("Context not found for the book with ID: " + booksData.ID);
                }
            }
                           
        
    });
});