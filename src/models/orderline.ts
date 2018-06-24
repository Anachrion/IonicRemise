export class OrderLine {

  constructor(public name: string,  public price: number = 0, public discount: number=0, public finalprice: number=0){
  };

  public equals (secondOrder :OrderLine):Boolean{
    return (secondOrder.name == this.name && secondOrder.price == this.price);
  }
}
