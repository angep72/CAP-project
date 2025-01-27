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
                serviceUrl: "/odata/odata/v4/patient-management/",
                synchronizationMode: "None"
            });

            this.getView().setModel(oModel);
        },
   
        onButtonPress:function(){
           const oRouter = this.getOwnerComponent().getRouter();
           oRouter.navTo("bookshop")
        },
       // This function is used to open dialog
        onAdd: function () {
            this.byId("addDialog").open();
        },
        onModify:function () {
           const oRouter = this.getOwnerComponent().getRouter();
           oRouter.navTo("OnModifyControl")
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
		//This is the function that help us to designe new products for posting
            const oList = oModel.bindList("/Books");
            const oContext = oList.create(newProduct);
            oContext.created().then(() => {
                MessageBox.success("Product added successfully");
                this.byId("addDialog").close()
                oModel.refresh();
            });

        },
        onOrderButton:function() {
            this.byId("Place-order").open()
        },
	    //This function is used delete the entry 
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
	    //The function is used to keep the upadated column
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
        //this function is used to navigate to another page
        onListItem:function(){
            const oRouter = this.getOwnerComponent().getRouter()
            oRouter.navTo("listItem");
        },
	     // This function is used to validate id 
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
        },
        onOrderButton:function(){
            this.byId("Place-order").open()
        },
        onCancelOrder:function(){
            this.byId("Place-order").close()
        },
        onSubmitOrder: function() {
            const product_ID = this.byId("new-product").getValue();
            const quantity = this.byId("quantity").getValue();
            const customer= this.byId("customer-id").getValue();
            console.log(product_ID, quantity, customer);
        
            fetch("http://localhost:4004/odata/v4/catalog/submitOrder", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({  // Convert the object to a JSON string
                    product_ID: product_ID,
                    quantity: quantity  ,
                    customer:customer
           
                   })
            })
            .then((response) => {
                if (!response.ok) {
                    return response.text().then((errorText) => {
                        throw new Error(
                            `HTTP error! Status: ${response.status} - ${errorText}`
                        );
                    });
                }
                MessageBox.success("Product created successfully!");
                this.onCancelOrder();
                this.getView().getModel().refresh();
            })
            .catch((error) => {
                MessageBox.error("Error creating product: " + error.message);
            });
        },
        onOpenDelete:function() {
            this.byId("DeletingOrder").open();
        },
        onCancelOrdering:function() {
            this.byId("DeletingOrder").close();
        },
        onSubmitOrdering:function(){
            const orderID = this.byId("order-product").getValue();
            fetch("http://localhost:4004/odata/v4/catalog/deleteOrder", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({  // Convert the object to a JSON string
                    orderID: orderID
           
                   })
            })
           .then((response) => {
             if (!response.ok) {
                    return response.text().then((errorText) => {
                        throw new Error(
                            `HTTP error! Status: ${response.status} - ${errorText}`
                        );
                    });
                }
                MessageBox.success("Order deleted successfully!");
                this.onCancelOrdering();
                this.getView().getModel().refresh();
            })
           .catch((error) => {
             MessageBox.error("Error deleting order: " + error.message);
             });
        },
        onHospitalsPress:function () {
         const oRouter= this.getOwnerComponent().getRouter();
         oRouter.navTo("HospitalsPage");
        },
        onAdminsPress:function () {
            const oRouter= this.getOwnerComponent().getRouter();
            oRouter.navTo("adminPages");
        },
        OnRegisternewPatient:function () {
            this.byId("newPatientdialog").open();
        },
        onCancelPatient:function () {
    this.byId("newPatientdialog").close();
        },
        onSubmitPatient:function () {
            const firstName = this.byId("firstnameId").getValue();
            const lastName = this.byId("lastnameId").getValue();
            const dateofBirth = this.byId("birthdateId").getValue();
            const email = this.byId("emaialId").getValue();
            const phone = this.byId("phoneId").getValue();
            const gender = this.byId("genderSelect").getSelectedKey();
            const address = this.byId("addressId").getValue();
            fetch("http://localhost:4000/odata/registerPatient", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({  // Convert the object to a JSON string
                    firstName: firstName,
                    lastName: lastName,
                    dateOfBirth: dateofBirth,
                    email: email,
                    phone: phone,
                    gender: gender,
                    address: address
                })
            })
           .then((response) => {
             if (!response.ok) {
                    return response.text().then((errorText) => {
                        throw new Error(
                            `HTTP error! Status: ${response.status} - ${errorText}`
                        );
                    });
                }
                MessageBox.success("Patient registered successfully!");
                this.onCancelPatient();
                this.getView().getModel().refresh();
            })
           .catch((error) => {
             MessageBox.error("Error in creating patient: " + error.message);
             });
            },
            // onBookAppoint:function(){
            //     this.byId("BookAppointmentDialog").open();
            // },
            onCancelBooking:function(){
                this.byId("BookAppointmentDialog").close();
            },
            onBookAppoint: function (oEvent) {
                // Get the source of the event
                const source = oEvent.getSource();
                console.log("Event Source:", source);
            
                // Traverse up the parent hierarchy to find the element with the binding context
                let context = null;
                let currentElement = source;
            
                while (currentElement && !context) {
                    context = currentElement.getBindingContext();
                    currentElement = currentElement.getParent();
                }
            
                if (!context) {
                    console.error("No binding context found for the selected item.");
                    return;
                }
            
                // Get the product ID from the context
                const productId = context.getObject().patientId;
                if (!productId) {
                    console.error("No product ID found in the binding context.");
                    return;
                }
            
                // Store the product ID in the controller for later use
                this._productIdToDelete = productId;
                console.log("Product ID to delete:", this._productIdToDelete);
                this.byId("BookAppointmentDialog").open();
                
            },
            onDelete:function(){
                
                const productId = this._productIdToDelete
                const order_date = this.byId("dateBooked").getValue();
                const reason = this.byId("reason").getValue();
                console.log("Product ID to delete:", productId, order_date, reason);
                fetch("http://localhost:4000/odata/bookAppointment", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({  // Convert the object to a JSON string
                        patientId: productId,
                        dateTime: order_date,
                        reason: reason
                    })
                })
                .then((response) => {
                    if (!response.ok) {
                        return response.text().then((errorText) => {
                            throw new Error(
                                `HTTP error! Status: ${response.status} - ${errorText}`
                            );
                        });
                    }
                    MessageBox.success("Appointment  successfully requested!");
                    this.onCancelBooking();
                    this.getView().getModel().refresh();
                })
                .catch((error) => {
                    MessageBox.error("Error cancelling appointment: " + error.message);
                });

            },
            onAccept:function(oEvent){
               // Get the source of the event
               const source = oEvent.getSource();

               console.log("Event Source:", source);
           
               // Traverse up the parent hierarchy to find the element with the binding context
               let context = null;
               let currentElement = source;
           
               while (currentElement && !context) {
                   context = currentElement.getBindingContext();
                   currentElement = currentElement.getParent();
               }
           
               if (!context) {
                   console.error("No binding context found for the selected item.");
                   return;
               }
               const statuses = context.getObject().status

               if(statuses === "REJECTED"){
                source.setEnabled(false);
                MessageBox.error(`The appointment is already ${statuses}`);
                return
             }
           
               // Get the patient ID from the context
               const appointmentId = context.getObject().appointmentId;
               if (!appointmentId) {
                   console.error("No product ID found in the binding context.");
                   return;
               }
           

                const status = "ACCEPTED";
                fetch("http://localhost:4000/odata/updateAppointmentStatus",{
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({  // Convert the object to a JSON string
                        appointmentId: appointmentId,
                        status: status
                    })
                })
                .then((response) => {
                    if (!response.ok) {
                        return response.text().then((errorText) => {
                            throw new Error(
                                `HTTP error! Status: ${response.status} - ${errorText}`
                            );
                        });
                    }
                    MessageBox.success("Appointment Acceptted!");
                    source.setEnabled(false);

                    this.onCancelBooking();
                  this.getView().getModel().refresh();
                })
                .catch((error) => {
                    MessageBox.error("Error declining appointment: " + error.message);
                });
            },
            onDecline: function(oEvent) {
                // Get the source of the event
                const source = oEvent.getSource();
                console.log("Event Source:", source);
            
                // Traverse up the parent hierarchy to find the element with the binding context
                let context = null;
                let currentElement = source;
            
                while (currentElement && !context) {
                    context = currentElement.getBindingContext();
                    currentElement = currentElement.getParent();
                }
            
                if (!context) {
                    console.error("No binding context found for the selected item.");
                    return;
                }
            
                const statuses = context.getObject().status;
                if (statuses === "ACCEPTED") {
                    source.setEnabled(false);
                    MessageBox.error(`The appointment is already ${statuses}`);
                    return;
                }
            
                const appointmentId = context.getObject().appointmentId;
                if (!appointmentId) {
                    console.error("No patientId found in the binding context.");
                    return;
                }
            
                // Add confirmation dialog before declining
                MessageBox.confirm("Are you sure you want to decline this appointment?", {
                    title: "Decline Confirmation",
                    onClose: (oAction) => {
                        if (oAction === MessageBox.Action.OK) {
                            const status = "REJECTED";
                            fetch("http://localhost:4000/odata/updateAppointmentStatus", {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                },
                                body: JSON.stringify({
                                    appointmentId: appointmentId,
                                    status: status
                                })
                            })
                            .then((response) => {
                                if (!response.ok) {
                                    return response.text().then((errorText) => {
                                        throw new Error(
                                            `HTTP error! Status: ${response.status} - ${errorText}`
                                        );
                                    });
                                }
                                MessageBox.success("Appointment declined!");
                                source.setEnabled(false);
                                this.onCancelBooking();
                                this.getView().getModel().refresh();
                            })
                            .catch((error) => {
                                MessageBox.error("Error declining appointment: " + error.message);
                            });
                        }
                    }
                });
            }
            
    
              
              
    })
});
