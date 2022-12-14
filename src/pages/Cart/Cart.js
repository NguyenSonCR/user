import styles from './Cart.module.scss';
import classNames from 'classnames/bind';
import { useContext, useEffect, useState } from 'react';
import images from '~/assets/img';
import Button from '~/components/Button';
import { CartContext } from '~/contexts/CartContext';
import { AuthContext } from '~/contexts/AuthContext';
import CartProduct from '~/layouts/components/CartProduct';
import config from '~/config';
import Spinner from '~/components/Spinner';
import { ToastContext } from '~/contexts/ToastContext';
import NaviMobi from '~/layouts/components/NaviMobi';

const cx = classNames.bind(styles);
function Cart() {
  const width = window.innerWidth > 0 ? window.innerWidth : window.screen.width;
  const {
    cartState: { cart, productSelect, cartLoading },
    getAllCart,
    resetProductChoose,
    selectAllProduct,
    addProductCheckout,
  } = useContext(CartContext);

  const {
    authState: { user },
    chooseNavigation,
  } = useContext(AuthContext);

  const {
    toastState: { toastList },
    addToast,
    deleteToast,
  } = useContext(ToastContext);

  useEffect(() => {
    chooseNavigation('cart');
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    return () => {
      toastList.length > 0 &&
        toastList.forEach((toast) => {
          deleteToast(toast.id);
        });
    };
    // eslint-disable-next-line
  });

  const [totalMoney, setTotalMoney] = useState(0);
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    if (productSelect && productSelect.length > 0) {
      const newTotalMoney = productSelect.reduce((total, item) => {
        return total + item.priceCurrent * item.amount;
      }, 0);
      setTotalMoney(newTotalMoney);
    } else {
      setTotalMoney(0);
    }
    if (cart && productSelect && productSelect.length === cart.products.length) {
      setIsChecked(true);
    } else {
      setIsChecked(false);
    }
  }, [productSelect, cart]);

  const handleOnChange = () => {
    let chooseAllProduct = null;
    if (cart) {
      chooseAllProduct = cart.products.map((cartItem) => {
        return {
          productId: cartItem.product.productId,
          priceCurrent: cartItem.product.priceCurrent,
          amount: cartItem.amount,
        };
      });
    }

    if (isChecked === false) {
      setIsChecked(true);
      selectAllProduct(chooseAllProduct);
    } else {
      setIsChecked(false);
      resetProductChoose();
    }
  };

  const handleBuy = async (productSelect) => {
    try {
      const response = await addProductCheckout({ username: user.username, checkout: productSelect });
      if (!response.success) {
        addToast({
          id: toastList.length + 1,
          title: 'Th???t b???i',
          content: response.message,
          type: 'error',
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAllCart(user.username);
    resetProductChoose();
    // eslint-disable-next-line
  }, [user.username]);

  let body = null;

  if (cartLoading) {
    <div>
      <Spinner />
    </div>;
  } else if (cart && cart.products.length > 0) {
    if (width > 740) {
      body = (
        <div className={cx('wrapper')}>
          <div className={cx('main')}>
            <div className={cx('header')}>
              <h4 className={cx('header-text')}>Gi??? h??ng</h4>
            </div>
            <div className={cx('content')}>
              <div className={cx('content-header')}>
                <div className={cx('content__checkbox')}>
                  <input
                    type={'checkbox'}
                    id="product"
                    name="product"
                    value=""
                    checked={isChecked}
                    onChange={handleOnChange}
                    className={cx('header-checkbox')}
                  />
                </div>
                <div className={cx('content__title')} onClick={handleOnChange}>
                  <p className={cx('content__text')}>S???n ph???m </p>
                </div>
                <div className={cx('content__list')}>
                  <p className={cx('content__text')}> ????n gi??</p>
                  <p className={cx('content__text')}> S??? l?????ng </p>
                  <p className={cx('content__text')}> S??? ti???n </p>
                  <p className={cx('content__text')}> Thao t??c</p>
                </div>
              </div>
            </div>
            {cart &&
              cart.products &&
              cart.products.map((cartItem, index) => (
                <CartProduct key={index} cartItem={cartItem} setTotalMoney={setTotalMoney} />
              ))}

            <div className={cx('content')}>
              <div className={cx('content-footer')}>
                <div className={cx('content__checkbox')}>
                  <input
                    type={'checkbox'}
                    id="total"
                    name="total"
                    value=""
                    checked={isChecked}
                    onChange={handleOnChange}
                    className={cx('header-checkbox')}
                  />
                </div>
                <div className={cx('content__title')}>
                  <label className={cx('content__text')} htmlFor="total">
                    Ch???n t???t c???
                  </label>
                </div>
                <div className={cx('content__list')}>
                  <p className={cx('content__list-text')}> S???n ph???m({productSelect && productSelect.length})</p>
                  <p className={cx('content__text', 'text')}>
                    T???ng thanh to??n: {totalMoney.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}??
                  </p>
                  {productSelect.length === 0 ? (
                    <Button fill disable>
                      Mua h??ng
                    </Button>
                  ) : (
                    <Button to={config.routes.checkout} fill onClick={() => handleBuy(productSelect)}>
                      Mua h??ng
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      body = (
        <div className={cx('wrapper')}>
          <div className={cx('main')}>
            <div className={cx('header')}>
              <h4 className={cx('header-text')}>Gi??? h??ng c???a t??i</h4>
            </div>
            <div className={cx('content')}>
              {/* <div className={cx('content-header')}>
                <div className={cx('content__checkbox')}>
                  <input
                    type={'checkbox'}
                    id="product"
                    name="product"
                    value=""
                    checked={isChecked}
                    onChange={handleOnChange}
                    className={cx('header-checkbox')}
                  />
                </div>
                <div className={cx('content__title')} onClick={handleOnChange}>
                  <p className={cx('content__text')}>S???n ph???m </p>
                </div>
                <div className={cx('content__list')}>
                  <p className={cx('content__text')}> ????n gi??</p>
                  <p className={cx('content__text')}> S??? l?????ng </p>
                  <p className={cx('content__text')}> S??? ti???n </p>
                  <p className={cx('content__text')}> Thao t??c</p>
                </div>
              </div> */}
            </div>
            {cart &&
              cart.products &&
              cart.products.map((cartItem, index) => (
                <CartProduct key={index} cartItem={cartItem} setTotalMoney={setTotalMoney} />
              ))}

            <div className={cx('content-mobile')}>
              <div className={cx('content__checkbox')}>
                <input
                  type={'checkbox'}
                  id="total"
                  name="total"
                  value=""
                  checked={isChecked}
                  onChange={handleOnChange}
                  className={cx('header-checkbox')}
                />
              </div>

              <div className={cx('content__list-mobile')}>
                <p className={cx('content__text', 'text')}>
                  T???ng c???ng: {totalMoney.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}??
                </p>
                {productSelect.length === 0 ? (
                  <Button primary disable>
                    Mua h??ng
                  </Button>
                ) : (
                  <Button to={config.routes.checkout} primary onClick={() => handleBuy(productSelect)}>
                    Mua h??ng({productSelect && productSelect.length})
                  </Button>
                )}
              </div>
            </div>
          </div>
          <NaviMobi />
        </div>
      );
    }
  } else {
    body = (
      <div className={cx('cart-null')}>
        <div>
          <img className={cx('cart-null-img')} src={images.noCart} alt=""></img>
        </div>
        <p className={cx('cart-null-text')}>Gi??? h??ng tr???ng</p>
        <Button primary to={config.routes.home}>
          Mua h??ng ngay
        </Button>
        {width < 740 && <NaviMobi />}
      </div>
    );
  }
  return body;
}

export default Cart;
