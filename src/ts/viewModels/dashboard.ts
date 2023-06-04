import * as AccUtils from "../accUtils";
import * as ko from "knockout";
import MutableArrayDataProvider = require("ojs/ojmutablearraydataprovider");
import "ojs/ojselectsingle";
import "ojs/ojlabel";
import "ojs/ojchart";
import "ojs/ojlistview"
import * as storeData from "text!../store_data.json";
import * as ResponsiveUtils from "ojs/ojresponsiveutils";
import * as ResponsiveKnockoutUtils from "ojs/ojresponsiveknockoututils";
import * as HtmlUtils from "ojs/ojhtmlutils";
import "ojs/ojmodule-element";
import "ojs/ojavatar"
import { ObservableKeySet } from "ojs/ojknockout-keyset";
import { ojListView } from "ojs/ojlistview";


type ChartType = {
  value: string;
  label: string;
};

type Activity = { 
  id : number
}
type Item = {
  id: number;
  name: string;
  short_desc: string;
  price: number;
  quantity: number;
  quantity_shipped: number;
  quantity_instock: number;
  activity_id: number;
  image: string;
};

type ActivityItems = {
  id: number;
  name: string;
  items: Array<Item>;
  short_desc: string;
  image: string;
};

class DashboardViewModel {

  // Observables for Activities
  selectedActivity = new ObservableKeySet();
  activitySelected = ko.observable(false);  // Controls display of Activity Items
  firstSelectedActivity = ko.observable();
  selectedActivityIds = ko.observable();

  // Observables for Activity Items
  itemSelected = ko.observable(false);
  selectedItem = ko.observable();
  firstSelectedItem = ko.observable();

  chartTypes: Array<Object>;
  chartTypesDP: MutableArrayDataProvider<ChartType["value"], ChartType>;
  val : ko.Observable<string>;
  chartDataProvider: MutableArrayDataProvider<string, {}>;
  chartData : Array<Object>;
  activityDataProvider : MutableArrayDataProvider<Activity["id"], Activity>;
  large : ko.Observable<Boolean>;
  moduleConfig: ko.PureComputed<any>;

  activityArray :Array<Object>;
  itemsArray :Array<Object>;

  itemData: ko.Observable<any>;
  pieSeriesValue: ko.ObservableArray;

  itemsDataProvider: MutableArrayDataProvider<Item["id"],Item>;
  // activityData : Array<Object>;

  constructor() {
    this.val = ko.observable("pie")
    this.chartTypes = [
       { value: "pie", label: "Pie" },
       { value: "bar", label: "Bar" },
       ];

    this.chartData = [
        { "id": 0, "series": "Baseball", "group": "Group A", "value": 42 },
        { "id": 1, "series": "Baseball", "group": "Group B", "value": 34 },
        { "id": 2, "series": "Bicycling", "group": "Group A", "value": 55 },
        { "id": 3, "series": "Bicycling", "group": "Group B", "value": 30 },
        { "id": 4, "series": "Skiing", "group": "Group A", "value": 36 },
        { "id": 5, "series": "Skiing", "group": "Group B", "value": 50 },
        { "id": 6, "series": "Soccer", "group": "Group A", "value": 22 },
        { "id": 7, "series": "Soccer", "group": "Group B", "value": 46 }
     ];

     let activityArray = JSON.parse(storeData);
     let itemsArray = activityArray[0].items;



    this.chartTypesDP = new MutableArrayDataProvider(
       this.chartTypes, {
       keyAttributes: "value",
       });

    this.chartDataProvider = new MutableArrayDataProvider(
       this.chartData, {
        keyAttributes : "id"
       });
       
    this.activityDataProvider = new MutableArrayDataProvider<
    Activity["id"],
    Activity
    >(activityArray, {
       keyAttributes: "id",
     });

     this.itemsDataProvider = new MutableArrayDataProvider(
      itemsArray,{
        keyAttributes : "id"
      }
     )

    this.itemData = ko.observable(''); 
    this.itemData(activityArray[0].items[0]);

    this.pieSeriesValue = ko.observableArray([]);
        
    let pieSeries = [
      { name: "Quantity in Stock", items: [this.itemData().quantity_instock] },
      { name: "Quantity Shipped", items: [this.itemData().quantity_shipped] }
    ];
    this.pieSeriesValue(pieSeries);

  //    const lgQuery = ResponsiveUtils.getFrameworkQuery(
  //     ResponsiveUtils.FRAMEWORK_QUERY_KEY.LG_UP
  //  );
   
  //  this.large = ResponsiveKnockoutUtils.createMediaQueryObservable(lgQuery);
  //  this.moduleConfig = ko.pureComputed(() => {
  //     let viewNodes = HtmlUtils.stringToNodeArray(
  //     this.large() ? lg_xl_view : sm_md_view
  //     );
  //     return { view: viewNodes };
  //  });
     
  }

  selectedActivityChanged = (event: ojListView.firstSelectedItemChanged<ActivityItems["id"], ActivityItems>) => {
    /**
     *  If no items are selected, then this property firstSelectedItem 
     *  will return an object with both key and data properties set to null.
    */
    let itemContext = event.detail.value.data;

    if (itemContext != null) {    
       // If selection, populate and display list
       // Hide currently-selected activity item
       this.activitySelected(false);

       let itemsArray = itemContext.items;
       this.itemsDataProvider.data = itemsArray;
       // Set List View properties
       this.activitySelected(true);
       this.itemSelected(false);
       this.selectedItem();
       this.itemData();

    } else {
        // If deselection, hide list
        this.activitySelected(false);
        this.itemSelected(false);
    }
  };
  
  selectedItemChanged = (event: ojListView.firstSelectedItemChanged<Item["id"], Item>) => {

    let isClicked = event.detail.value.data;
 
    if (isClicked != null) {
 
       // If selection, populate and display list
       this.itemData(event.detail.value.data);
 
       // Create variable and get attributes of the items list to set pie chart values
       let pieSeries = [
       { name: "Quantity in Stock", items: [this.itemData().quantity_instock] },
       { name: "Quantity Shipped", items: [this.itemData().quantity_shipped] }
       ];
       // Update the pie chart with the data
       this.pieSeriesValue(pieSeries);
 
       this.itemSelected(true);
 
    }
    else {
    // If deselection, hide list
      this.itemSelected(false);       
 
    }
  };


  /**
   * Optional ViewModel method invoked after the View is inserted into the
   * document DOM.  The application can put logic that requires the DOM being
   * attached here.
   * This method might be called multiple times - after the View is created
   * and inserted into the DOM and after the View is reconnected
   * after being disconnected.
   */
  connected(): void {
    AccUtils.announce("Dashboard page loaded.");
    document.title = "Dashboard";
    // implement further logic if needed
  }

  /**
   * Optional ViewModel method invoked after the View is disconnected from the DOM.
   */
  disconnected(): void {
    // implement if needed
  }

  /**
   * Optional ViewModel method invoked after transition to the new View is complete.
   * That includes any possible animation between the old and the new View.
   */
  transitionCompleted(): void {
    // implement if needed
  }
}

export = DashboardViewModel;
