sap.ui.define([
    "./BaseController",
    "sap/m/MessageBox",
    "sap/ui/model/odata/v4/ODataModel",
    "sap/m/MessageBox"
], function (BaseController, MessageBox, ODataModel) {
    "use strict";

    return BaseController.extend("com.myorg.myapp.controller.Main", {
		//This controller uses Odata version 4
        onInit: function () {
            const oModel = new ODataModel({
                serviceUrl: "http://localhost:4000/odata/",
                synchronizationMode: "None"
            });

            this.getView().setModel(oModel);
        },
       // This function is used to open dialog
        onAdd: function () {
            this.byId("addDialog").open();
        },
	    // This function is used to close the creating new entry dialog
        onCancelAdd: function () {
            this.byId("addDialog").close();
        },
       // This function is used to save new product
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
                const oList = this.byId("idTable"); // Adjust ID based on your view
                if (oList) {
                    oList.getBinding("items").refresh();
                }
            })
            .catch(oError => {
                console.error(oError);
                MessageBox.error("Update failed: " + (oError.message || oError));
            });
        },

        onListItem:function(){
            const oRouter = this.getOwnerComponent().getRouter()
            oRouter.navTo("listItem");
        },
        validateBookId: function(oEvent) {
            var oInput = oEvent.getSource();
            var sValue = oInput.getValue();
            var bValidInput = /^\d+$/.test(sValue); // Regex to check if the input contains only digits

            if (sValue === "") {
                oInput.setValueState("Error");
                oInput.setValueStateText("Book ID is required");
            } else if (!bValidInput) {
                oInput.setValueState("Error");
                oInput.setValueStateText("Book ID must be a number");
            } else {
                oInput.setValueState("None");
            }
        },
        validateTitle: function(oEvent) {
            var oInput = oEvent.getSource();
            var bValidInput = /^[a-zA-Z\s]+$/.test(sValue); // Regex to check if the input contains only letters and spaces
            if (sValue === "") {
                 oInput.setValueState("Error");
                   oInput.setValueStateText("Title is required");
             } else if (!bValidInput) {
                oInput.setValueState("Error");
                 oInput.setValueStateText("Title must contain only letters and spaces");  

            }else {
                oInput.setValueState("None");}
            
        }  ,
        onSmartControls:function(){
            const oRouter = this.getOwnerComponent().getRouter()
            oRouter.navTo("smartControls");
        }

    });
});
