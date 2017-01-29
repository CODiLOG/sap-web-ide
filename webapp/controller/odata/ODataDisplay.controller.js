sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/m/MessageToast"
], function(Controller, MessageToast) {
  "use strict";

  return Controller.extend("demo.controller.odata.ODataDisplay", {
    onLoadData: function() {
      // set the busy indicator to avoid multi clicks
      var oBusyIndicator = new sap.m.BusyDialog();
      oBusyIndicator.open();

      //Get historical data from OData Service
      $.ajax({
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        url: "/HCPOData/public/timeseries/odata/timeseries.xsodata/TimeSeriesData/?&orderby=Date desc",
        type: "GET",
        async: false,
        success: function(data) {
          try {
            var oHistoricalData = data.d.results;
            // We need to format the date using a formatter
            var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
              pattern: "yyyy-MM-dd"
            });
            // timezoneOffset is in hours convert to milliseconds  
            var TZOffsetMs = new Date(0).getTimezoneOffset() * 60 * 1000;
            // we need to parse the date provided bay the odata service as an int to consume it in the VizFrame
            for (var i = 0; i < oHistoricalData.length; i++) {
              oHistoricalData[i].DateDimension = parseInt(oHistoricalData[i].Date.replace(/[^0-9\.]/g, ''), 10);
              oHistoricalData[i].DateString = dateFormat.format(new Date(oHistoricalData[i].DateDimension + TZOffsetMs));
            }
            //Save historical data in the model
            sap.ui.getCore().getModel().setProperty("/historicalData", oHistoricalData);
          } catch (err) {
            MessageToast.show("Caught - onLoadData[ajax success] :" + err.message);
          }
          oBusyIndicator.close();
        },
        error: function(request, status, error) {
          MessageToast.show("Caught - onLoadData[ajax error] :" + request.responseText);
          oBusyIndicator.close();
        }
      });
    },
    onRenderCompleteHistoricalDataVizFrame: function(oEvent) {
      // this will connect the VizFrame with the PopOver so we can sse the value when selected
      var oPopover = this.getView().byId("idHistoricalDataPopover");
      var oVizFrame = this.getView().byId("idHistoricalDataVizFrame");
      oPopover.connect(oVizFrame.getVizUid());
    }
  });
});
