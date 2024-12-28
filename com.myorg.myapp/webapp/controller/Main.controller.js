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
                        context.delete().then(function () {
                            MessageBox.success("Product deleted successfully!");
                        }).catch(function (oError) {
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
                ID: this._selectedBookId,
                title: this.byId("editTitle").getValue(),
                author: this.byId("editAuthor").getValue(),
                stock: parseInt(this.byId("editStock").getValue(), 10),
                price: parseFloat(this.byId("editPrice").getValue())
            };
            
            // Create a deferred binding
            const sPath = "/Books(" + booksData.ID + ")";
            const oBinding = oModel.bindContext(sPath, null, {
                $$groupId: "$auto",
                $$updateGroupId: "$auto"
            });
        
            // Execute the request
            oBinding.requestObject().then((oData) => {
                if (!oData) {
                    throw new Error("Book not found");
                }
        
                // Get the binding context
                const oContext = oBinding.getBoundContext();
                
                // Update the properties
                Object.keys(booksData).forEach(key => {
                    oContext.setProperty(key, booksData[key]);
                });
                
                // Submit changes
                return oModel.submitBatch("$auto");
            })
            .then(() => {
                MessageBox.success("Product updated successfully");
                this.byId("editDialog").close();
                
                // Refresh the list binding
                const oList = this.byId("booksList"); // Adjust ID based on your view
                if (oList) {
                    oList.getBinding("items").refresh();
                }
            })
            .catch(oError => {
                console.error(oError);
                MessageBox.error("Update failed: " + (oError.message || oError));
            });
        }
        
        

    });
});