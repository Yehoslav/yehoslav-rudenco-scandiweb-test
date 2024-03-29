import { Component } from "react";
import { connect } from "react-redux";
import {
  increaseProductAmmount,
  decreaseProductAmmount,
} from "../../lib/cartSlice";
import { totalPrice } from "../../utils/funcs.js";

import CartIcon from "./CartIcon";
import CartItem from "../cart-item";

import "./mini-cart.scss";
import { Link } from "react-router-dom";

class MiniCart extends Component {
  createCartItems = (product) => {
    const { symbol, increaseAmount, decreaseAmount } = this.props;

    return (
      <CartItem
        key={product.id}
        {...product}
        price={product.prices.find((price) => price.currency.symbol === symbol)}
        onIncrease={() => increaseAmount(product.id)}
        onDecrease={() => decreaseAmount(product.id)}
        inMiniCart={true}
      />
    );
  };

  render() {
    const { symbol, products, onToggleDropdown } = this.props;

    const items =
      products.length > 0 ? (
        products.map(this.createCartItems)
      ) : (
        <h3>No items</h3>
      );

    const content = (
      <>
        <ul className="col-g24 cart-list f-16">
          <div>
            <span className="fp-b">My bag</span>, {products.length} items
          </div>
          <div className="item-list">{items}</div>
          <div className="row sb fp-sb">
            <div>Total</div>
            <div>
              {symbol}
              {totalPrice(products, symbol)}
            </div>
          </div>
          <div className="row-g12">
            <Link
              to="/cart"
              onClick={() => onToggleDropdown("showMiniCart")}
              style={{ width: 140 }}
              className="btn btn__sec t__upper f-14 fp-sb"
            >
              view bag
            </Link>
            <button
              onClick={() => {
                alert(
                  `Order placed: ${products.reduce((previous, current) => {
                    return previous + current.amount;
                  }, 0)} products.`
                );
                onToggleDropdown("showMiniCart");
              }}
              style={{ width: 140, height: 43 }}
              className="btn btn__pri t__upper f-14 fp-sb"
            >
              check out
            </button>
          </div>
        </ul>
        <div
          onClick={() => onToggleDropdown("showMiniCart")}
          className="overlay"
        ></div>
      </>
    );

    return (
      <div className="dropdown">
        <button onClick={onToggleDropdown} className="action">
          <div className="f-14 fp-b num">
            {products.length > 9 ? "9+" : products.length}
          </div>
          <CartIcon />
        </button>
        {this.props.showDropdown ? content : null}
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    products: state.cart.products,
    status: state.cart.status,
    symbol: state.currency.globalCurrency.symbol,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    increaseAmount: (id) => dispatch(increaseProductAmmount(id)),
    decreaseAmount: (id) => dispatch(decreaseProductAmmount(id)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(MiniCart);
