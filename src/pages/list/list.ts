import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { ItemDetailsPage } from '../item-details/item-details';
import { OrderLine } from '../../models/orderline';
import { AlertController } from 'ionic-angular';



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
    for(let i = 1; i < 11; i++) {
      this.items.push(
        new OrderLine ('Article ' + i, Math.floor(Math.random()*100))
      )
    }
  }

  addNewItem(order: OrderLine) {
    this.items.push(order);
    this.updatePromotion();
  }

  lineDiscount(order): number {
    let result = order.price/100*(100-order.discount);
    return Math.round((result * 100) / 100);
  }

  updatePromotion() {
    console.log('updatePromotion');
    // itemsClone = this.items.slice(0);
    console.log(this.items);

    let itemsClone: OrderLine[] = JSON.parse(JSON.stringify(this.items));
    //let itemsClone = this.items.map(x => Object.assign({}, x));
    console.log(itemsClone);

    let updatedList = this.promotionStep(itemsClone, this.initialAmount);
    console.log(updatedList);
  }

  promotionStep(orderset: OrderLine[], actualAmount: number) {
    console.log("1.");
    console.log(actualAmount);
    console.log(orderset);

    let actualDiscount;
    let nextDiscount;
    for (let discount of this.discounts) {
      if (actualAmount<discount.amount){
        nextDiscount = discount;
        break;
      }
      actualDiscount= discount;
    }
    console.log(actualDiscount);
    /* Discount init and final pricing */
    orderset.forEach(item => {item.discount = actualDiscount.percentage;
    item.finalprice = Math.round(((item.price/100*(100-item.discount)) * 100) / 100);});

    /* calcul différentiel pallier */
    if (!nextDiscount) {
      console.log("max discount already achieved");
      return orderset;
    }
    console.log("nextDiscount");
    console.log(nextDiscount);

    let diffNextStep = nextDiscount.amount - actualAmount;
(a, b) => a.finalprice + b.finalpric
    /* vérification si on peut atteindre le prochain palier*/
    let minSubset = this.minSubsetGreaterThan (orderset.slice(0), diffNextStep);
    console.log("minSubset result :");
    console.log(minSubset);
    /* pas possible */
    if(!minSubset) {
      console.log("no subset can reach next promotion level");
      return orderset;
    }
    /* possible */
    /* differentiel entre le subset actuel
     et le subset nécessaire pour atteindre le prochain palier
     => reste */
     console.log("1 : orderset");
     console.log(orderset);
     let diffsubset = orderset.filter(this.orderSubsetDiff(minSubset));
     /* Test */
     console.log("2 : orderset")
     console.log(orderset);
     console.log("diffsubset");
     console.log(diffsubset);
     console.log("minSubset");
     console.log(minSubset);

     /* Calcul du montant actualisé*/
     let newAmount = actualAmount + minSubset.reduce((sum, item) =>  sum + item.finalprice, 0);

     /* récursion nouveau montant, reste du pannier */
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
            placeholder: 'Nom article',
            value: 'Article #'+(this.items.length+1)
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
              console.log(data);
              this.addNewItem(new OrderLine (data.name?data.name:undefined,
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
          }
        }
      }
      return minsubset;
    }
  }
