import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { ItemDetailsPage } from '../item-details/item-details';
import { OrderLine } from '../../models/orderline';
import { AlertController } from 'ionic-angular';
//import * as _ from "lodash";




@Component({
  selector: 'page-list',
  templateUrl: 'list.html'
})
export class ListPage {
  items: OrderLine[];
  initialAmount: number = 0;
  discounts: Array<{amount: number, percentage: number}>;

  constructor(public navCtrl: NavController, public navParams: NavParams, private alertCtrl: AlertController) {
    this.discounts = [];
    this.discounts.push({amount: 0 ,percentage: 0});
    this.discounts.push({amount: 500 ,percentage: 5});
    this.discounts.push({amount: 1000 ,percentage: 10});
    this.discounts.push({amount: 1500 ,percentage: 15});
    this.discounts.push({amount: 2500 ,percentage: 20});

    this.items = [];
  }

  addNewItem(order: OrderLine) {
    this.items.push(order);
    this.updatePromotion();
  }

  orderTotalTTC (){
    return Math.round((this.items.reduce((sum, item) =>  sum + item.price, 0))* 100) / 100;;
  }

  orderTotalPromotionIncluded (){
    return Math.round((this.items.reduce((sum, item) =>  sum + item.finalprice, 0))* 100) / 100;
  }

  clone<T>(instance: T): T {
    const copy = new (instance.constructor as { new (): T })();
    Object.assign(copy, instance);
    return copy;
  }

  dicountColor (percentage: number): string {
    let color;
    switch(percentage) {
      case 5:
      color = "#62f442";
      break;
      case 10:
      color = "#4d8cf9";
      break;
      case 15:
      color = "#ffa530";
      break;
      case 20:
      color = "#af1815";
      break;
      default:
      color = "#5b5b5b";
    }
    return color;
  }

  updatePromotion() {
    let itemsClone:Array<OrderLine> = [];
    for (let item of this.items)  {
      itemsClone.push(this.clone(item));
    }
    this.items = this.promotionStep(itemsClone, this.initialAmount);
  }

  promotionStep(orderset: OrderLine[], actualAmount: number) {
    console.log("promotionStep BEGIN");
    console.log("actualAmount : "+actualAmount);

    /* Check promotion level reached */
    let actualDiscount;
    let nextDiscount;
    for (let discount of this.discounts) {
      if (actualAmount<discount.amount){
        nextDiscount = discount;
        break;
      }
      actualDiscount= discount;
    }
    /* Discount init and final pricing */
    orderset.forEach(item => {item.discount = actualDiscount.percentage;
      item.finalprice = Math.round(item.price/100*(100-item.discount) * 100) / 100;
    });

    console.log("====== CURRENT SET LOG BEGIN =======");
    for (let item of orderset)  {
      console.log(item);
    }
    console.log("====== CURRENT SET LOG END  =======");


    /* Promotion level differential calculation  */
    if (!nextDiscount) {
      console.log("max discount already achieved");
      return orderset;
    }
    console.log("nextDiscount");
    console.log(nextDiscount);

    let diffNextStep = nextDiscount.amount - actualAmount;

    /* Checks if the next promotion level is reacheable, and returns the best subset */
    let minSubset = this.minSubsetGreaterThan (orderset.slice(0), diffNextStep);

    /* Next promotion level unreacheable */
    if(!minSubset) {
      console.log("no subset can reach next promotion level");
      return orderset;
    }

    console.log("====== CURRENT MINSUBSET LOG BEGIN =======");
    for (let item of minSubset)  {
      console.log(item);
    }
    console.log("====== CURRENT MINSUBSET LOG END  =======");

    /* Next promotion level reacheable */
    let diffsubset = orderset.filter(this.orderSubsetDiff(minSubset));
    console.log("====== CURRENT DIFFSUBSET LOG BEGIN =======");
    for (let item of diffsubset)  {
      console.log(item);
    }
    console.log("====== CURRENT DIFFSUBSET LOG END  =======");

    /* Actual amount calculation */
    let minsubsetsum: number = minSubset.reduce((sum, item) =>  sum + item.finalprice, 0);
    console.log ("minsubsetsum : "+minsubsetsum);
    let newAmount: number = actualAmount + minsubsetsum;
    console.log ("newAmount : "+newAmount);

    /* Recursion */
    let nextSubset = this.promotionStep(diffsubset,newAmount);
    return minSubset.concat(nextSubset);
  }

  orderSubsetDiff (secondArray: OrderLine[]) {
    return function(current: OrderLine){
      return secondArray.filter(function(other){return other.equals(current)}).length == 0;
    }
  }

  addItemAlert() {
    {
      const prompt = this.alertCtrl.create({
        title: 'Ajouter un article',
        message: "",
        inputs: [
          {
            name: 'price',
            placeholder: 'Prix',
            type: 'number'
          },
          {
            name: 'name',
            placeholder: 'Article #'+(this.items.length+1)
          },
        ],
        buttons: [
          {
            text: 'Annuler',
            handler: data => {
            }
          },
          {
            text: 'Ajouter',
            handler: data => {
              this.addNewItem(new OrderLine (data.name.length!=0 ? data.name : 'Article #'+(this.items.length+1),
              data.price?Math.round(data.price * 100) / 100:undefined));
            }
          }
        ]
      });
      prompt.present();
    }
  }

  editItemAlert(event, item)
  {
    const prompt = this.alertCtrl.create({
      title: 'Editer un article',
      message: "",
      inputs: [
        {
          name: 'price',
          placeholder: 'Prix',
          type: 'number',
          value: item.price
        },
        {
          name: 'name',
          placeholder: 'Nom article',
          value: item.name
        },
      ],
      buttons: [
        {
          text: 'Annuler',
          handler: data => {
          }
        },
        {
          text: 'Supprimer',
          role: 'cancel',
          handler: data => {
            let index = this.items.indexOf(item);
            if (index == -1) {
              console.log("item not found");
              return;
            }
            this.items.splice(index, 1);
            this.updatePromotion();
          }
        },
        {
          text: 'Modifier',
          handler: data => {
            item.name=data.name;
            item.price=Math.round(data.price * 100) / 100;
            this.updatePromotion();
          }
        }
      ]
    });
    prompt.present();
  }
  editInitialAmount()
  {
    let amount = this.initialAmount;
    const prompt = this.alertCtrl.create({
      title: 'Editer le montant fidélité initial',
      message: "",
      inputs: [
        {
          name: 'amount',
          type: 'number',
          value: "0"
        }
      ],
      buttons: [
        {
          text: 'Annuler',
          handler: data => {
          }
        },
        {
          text: 'Modifier',
          handler: data => {
            this.initialAmount=Math.round(data.amount * 100) / 100;
            this.updatePromotion();
          }
        }
      ]
    });
    prompt.present();
  }

  powerSet(arr: OrderLine[]) {
    if(arr.length === 0) {
      return [[]];
    }
    let lastElement = arr.pop();
    let restPowerset = this.powerSet(arr);

    // for each set in the power set of arr (minus its last element),
    // include that set in the powerset of arr both with and without
    // the last element of arr
    let powerset = [];
    for(var i = 0; i < restPowerset.length; i++) {
      let set = restPowerset[i];
      // without last element
      powerset.push(set);
      // with last element
      set = set.slice();
      set.push(lastElement);
      powerset.push(set);
    }
    return powerset;
  }

  minSubsetGreaterThan  (arr: OrderLine[], number: number) {
    console.log ("minSubsetGreaterThan");
    console.log (arr);
    console.log (number);


    let powerset = this.powerSet(arr);

    let minsubset = undefined;
    let minsubsetsum = undefined;

    for(let subset of powerset) {
      let sum = subset.reduce((sum, item) =>  sum + item.finalprice, 0);
      // Initialization
      if (sum >= number) {
        if (!minsubset) {
          minsubset = subset;
          minsubsetsum = sum;
        }
        if(sum < minsubsetsum) {
          minsubset = subset;
          minsubsetsum = sum;
        }
      }
    }
    return minsubset;
  }
}
