sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel",
  "sap/ui/model/odata/v2/ODataModel",
], function (Controller, JSONModel, ODataModel) {
  "use strict";

  return Controller.extend("your.controller.name", {
    onInit: function () {
      // Set up the OData Model
      var oModel = new ODataModel("/path/to/your/service", true);
      this.getView().setModel(oModel);

      // Create a JSON model for testing purposes (optional)
      var oData = {
        items: [
          { Name: "John Doe", Age: 28, Country: "USA" },
          { Name: "Jane Smith", Age: 34, Country: "Canada" },
          { Name: "James Brown", Age: 22, Country: "UK" },
          { Name: "Emily Davis", Age: 41, Country: "Australia" },
          { Name: "Michael Clark", Age: 37, Country: "USA" },
        ]
      };
      var oJsonModel = new JSONModel(oData);
      this.getView().setModel(oJsonModel, "jsonModel");
    },

    onAfterRendering: function () {
      // Get the SmartTable control
      var oSmartTable = this.byId("smartTable");

      // Trigger the initial data binding (Optional)
      oSmartTable.rebindTable();
    }
  });
});
