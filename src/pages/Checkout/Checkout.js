import styles from './Checkout.module.scss';
import classNames from 'classnames/bind';
import { useContext, useEffect, useState } from 'react';

import { CartContext } from '~/contexts/CartContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot } from '@fortawesome/free-solid-svg-icons';
import Button from '~/components/Button';
import { ProductContext } from '~/contexts/ProductContext';
import { AuthContext } from '~/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import config from '~/config';
import { ToastContext } from '~/contexts/ToastContext';
const cx = classNames.bind(styles);

function Checkout() {
  const width = window.innerWidth > 0 ? window.innerWidth : window.screen.width;
  const {
    cartState: { cart, transports },
    getAllCart,
    addOrder,
    removeCart,
    deleteProductChoose,
    removeProductCheckout,
    getTransport,
  } = useContext(CartContext);

  const {
    authState: { user },
    putInfoUser,
  } = useContext(AuthContext);

  const {
    productState: { products },
    getProducts,
  } = useContext(ProductContext);

  useEffect(() => {
    getAllCart(user.username);
    getProducts();
    getTransport();
    // eslint-disable-next-line
  }, []);
  let checkoutProducts = null;
  if (cart && cart.checkout && products) {
    checkoutProducts = cart.checkout.map((item) => {
      return {
        product: products.find((product) => product.productId === item.productId),
        priceCurrent: item.priceCurrent,
        amount: item.amount,
      };
    });
  }
  let totalMoney = 0;
  if (checkoutProducts) {
    totalMoney = checkoutProducts.reduce((total, item) => {
      return total + item.priceCurrent * item.amount;
    }, 0);
  }

  const [formValue, setFormValue] = useState({
    phoneNumber: '',
    address: '',
  });
  useEffect(() => {
    if (user && user.phoneNumber && user.address) {
      setFormValue({
        phoneNumber: user.phoneNumber,
        address: user.address,
      });
    }
    // eslint-disable-next-line
  }, []);
  const { phoneNumber, address } = formValue;
  const onChangeForm = (event) => {
    setFormValue({
      ...formValue,
      [event.target.name]: event.target.value,
    });
  };

  const [validate, setValidate] = useState(false);

  const putUser = async (event) => {
    event.preventDefault();
    if (phoneNumber.length === 11 || phoneNumber.length === 10) {
      try {
        const response = await putInfoUser(user.username, formValue);
        if (response.success) {
          setModel(false);
          setValidate(false);
        } else {
          addToast({
            id: toastList.length + 1,
            title: 'Th???t b???i',
            content: response.message,
            type: 'warning',
          });
        }
      } catch (error) {
        console.log(error);
      }
    } else {
      addToast({
        id: toastList.length + 1,
        title: 'Th???t b???i',
        content: 'S??? ??i???n tho???i ph???i l?? 10 s??? ho???c 11 s???',
        type: 'warning',
      });
      return;
    }
  };
  const {
    toastState: { toastList },
    addToast,
  } = useContext(ToastContext);
  const navigate = useNavigate();
  const handleBuy = async () => {
    if (phoneNumber === '' || address === '') {
      addToast({
        id: toastList.length + 1,
        title: 'Th???t b???i',
        content: 'B???n ch??a nh???p th??ng tin giao h??ng',
        type: 'warning',
      });
      return;
    }
    try {
      const response = await addOrder({
        user,
        checkout: checkoutProducts,
        state: {
          confirm: false,
          cancel: false,
          packed: false,
          shipper: false,
          transported: false,
          done: false,
        },
        shipper: null,
        transport: transports[0],
      });
      if (response.success) {
        removeCart({ username: user.username, listProduct: checkoutProducts });

        for (let i = 0; i < checkoutProducts.length; i++) {
          deleteProductChoose(checkoutProducts[i].product.productId);
        }
        removeProductCheckout({ username: user.username, checkout: [] });

        addToast({
          id: toastList.length + 1,
          title: 'Th??nh c??ng',
          content: response.message,
          type: 'success',
        });
        navigate(config.routes.purchase);
      } else {
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

  const [model, setModel] = useState(false);

  const handleChangeInfo = () => {
    setValidate(true);
    setModel(true);
    setFormValue({
      phoneNumber: user.phoneNumber,
      address: user.address,
    });
  };

  let body = null;
  if (width > 740) {
    body = (
      <div className={cx('wrapper')}>
        <div className={cx('title')}>Thanh to??n</div>
        <div className={cx('content')}>
          <div className={cx('header')}>
            <div className={cx('header-title')}>
              <FontAwesomeIcon className={cx('header-title-icon')} icon={faLocationDot} />
              <p className={cx('header-title-text')}>?????a ch??? nh???n h??ng</p>
            </div>
            <div className={cx('header-info')}>
              {!user.phoneNumber || !user.address || model ? (
                <form className={cx('input')} onSubmit={putUser}>
                  <div className={cx('input-group')}>
                    <label className={cx('label')} htmlFor="phoneNumber">
                      Nh???p s??? ??i???n tho???i:
                    </label>
                    <input
                      name="phoneNumber"
                      value={phoneNumber}
                      type="number"
                      onChange={onChangeForm}
                      className={cx('input-form')}
                      required
                      id="phoneNumber"
                    ></input>
                  </div>
                  <div className={cx('input-group')}>
                    <label className={cx('label')} htmlFor="address">
                      Nh???p ?????a ch??? giao h??ng:
                    </label>
                    <input
                      type={'text'}
                      spellCheck="false"
                      name="address"
                      value={address}
                      onChange={onChangeForm}
                      className={cx('input-form')}
                      required
                      id="address"
                    ></input>
                  </div>
                  <div className={cx('input-submit')}>
                    <Button type="submit" text primary>
                      X??c nh???n
                    </Button>
                  </div>
                </form>
              ) : (
                <div className={cx('header-info')}>
                  <p className={cx('header-info-text')}>{user.fullName}</p>
                  <p className={cx('header-info-text')}>{user.phoneNumber}</p>
                  <div className={cx('header-info-address')}>{user.address}</div>
                  <div className={cx('header-info-default')}>M???c ?????nh</div>
                  <div className={cx('header-info-change')} onClick={handleChangeInfo}>
                    Thay ?????i
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className={cx('body')}>
            <div className={cx('body-header')}>
              <ul className={cx('body-header-list')}>
                <li className={cx('body-header-item')}>S???n ph???m</li>
                <li className={cx('body-header-item')}>????n gi??</li>
                <li className={cx('body-header-item')}>S??? l?????ng</li>
                <li className={cx('body-header-item')}>Th??nh ti???n</li>
              </ul>
            </div>
            <div className={cx('body-content')}>
              {checkoutProducts &&
                checkoutProducts.length > 0 &&
                checkoutProducts.map((item, index) => (
                  <div key={index} className={cx('checkout')}>
                    <img src={item.product.img} className={cx('checkout-img')} alt=""></img>
                    <div className={cx('checkout-description')}>{item.product.name}</div>
                    <div className={cx('checkout-properties')}>
                      {item.priceCurrent.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}??
                    </div>
                    <div className={cx('checkout-amount')}>{item.amount}</div>
                    <div className={cx('checkout-properties')}>
                      {(item.priceCurrent * item.amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}??
                    </div>
                  </div>
                ))}
            </div>
          </div>
          <div className={cx('body-footer')}>
            <div className={cx('body-footer-content')}>
              T???ng s??? ti???n <span> ({checkoutProducts && checkoutProducts.length} s???n ph???m) </span>:{' '}
              {totalMoney && totalMoney.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}??
            </div>
          </div>
        </div>
        <div className={cx('footer')}>
          <div className={cx('footer-title')}>
            <div className={cx('footer-title-text')}>Ph????ng th???c thanh to??n</div>
            <div>Thanh to??n khi nh???n h??ng</div>
          </div>
          <div className={cx('footer-list')}>
            <p className={cx('footer-item')}>T???ng ti???n h??ng</p>
            <p className={cx('footer-item')}>
              {totalMoney && totalMoney.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}??
            </p>
          </div>
          <div className={cx('footer-list')}>
            <p className={cx('footer-item')}>Ph?? v???n chuy???n</p>
            <p className={cx('footer-item')}>
              {transports ? transports[0].price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') : 0} ??
            </p>
          </div>
          <div className={cx('footer-list')}>
            <p className={cx('footer-item')}>T???ng thanh to??n</p>
            <p className={cx('footer-item')}>
              {totalMoney && transports && transports.length > 0
                ? (totalMoney + transports[0].price).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
                : totalMoney.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
              ??
            </p>
          </div>
          <div className={cx('checkout-buy')}>
            {!validate ? (
              <Button className={cx('checkout-btn-mobile')} primary fill onClick={handleBuy}>
                ?????t h??ng
              </Button>
            ) : (
              <Button className={cx('checkout-btn-mobile')} primary disable fill onClick={handleBuy}>
                ?????t h??ng
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  } else {
    body = (
      <div className={cx('wrapper')}>
        <div className={cx('title')}>Thanh to??n</div>
        <div className={cx('content')}>
          <div className={cx('header')}>
            <div className={cx('header-title')}>
              <FontAwesomeIcon className={cx('header-title-icon')} icon={faLocationDot} />
              <p className={cx('header-title-text')}>?????a ch??? nh???n h??ng</p>
            </div>
            <div className={cx('header-info-mobile-wrapper')}>
              {!user.phoneNumber || !user.address || model ? (
                <form className={cx('input')} onSubmit={putUser}>
                  <div className={cx('input-group')}>
                    <label className={cx('label')} htmlFor="phoneNumber">
                      Nh???p s??? ??i???n tho???i:
                    </label>
                    <input
                      name="phoneNumber"
                      value={phoneNumber}
                      type="number"
                      onChange={onChangeForm}
                      className={cx('input-form')}
                      required
                      id="phoneNumber"
                    ></input>
                  </div>
                  <div className={cx('input-group')}>
                    <label className={cx('label')} htmlFor="address">
                      Nh???p ?????a ch??? giao h??ng:
                    </label>
                    <input
                      type={'text'}
                      spellCheck="false"
                      name="address"
                      value={address}
                      onChange={onChangeForm}
                      className={cx('input-form')}
                      required
                      id="address"
                    ></input>
                  </div>
                  <div className={cx('input-submit')}>
                    <Button type="submit" text primary>
                      X??c nh???n
                    </Button>
                  </div>
                </form>
              ) : (
                <div className={cx('header-info-mobile')}>
                  <div className={cx('header-info-user')}>
                    <p className={cx('header-info-text')}>{user.fullName || user.username}</p>
                    <p className={cx('header-info-text')}>{user.phoneNumber}</p>
                  </div>
                  <div className={cx('header-address')}>
                    <div className={cx('header-info-address')}>{user.address}</div>
                    <div className={cx('header-info-default')}>M???c ?????nh</div>
                    <div className={cx('header-info-change')} onClick={handleChangeInfo}>
                      Thay ?????i
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className={cx('body')}>
            <div className={cx('body-content')}>
              {checkoutProducts &&
                checkoutProducts.length > 0 &&
                checkoutProducts.map((item, index) => (
                  <div key={index} className={cx('checkout-mobile')}>
                    <img src={item.product.img} className={cx('checkout-img-mobile')} alt=""></img>
                    <div className={cx('checkout-info')}>
                      <div className={cx('checkout-description-mobile')}>{item.product.name}</div>
                      <div className={cx('checkout-price')}>
                        <div className={cx('checkout-properties-mobile')}>
                          {(item.priceCurrent * item.amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}??
                        </div>
                        <div className={cx('checkout-amount')}> S??? l?????ng: {item.amount}</div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
          <div className={cx('body-footer-mobile')}>
            <span className={cx('body-footer-mobile-text')}>
              T???ng s??? ti???n ({checkoutProducts && checkoutProducts.length} s???n ph???m):{' '}
              {totalMoney && totalMoney.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}??
            </span>
          </div>
        </div>
        <div className={cx('footer')}>
          <div className={cx('footer-title')}>
            <div className={cx('footer-title-text-mobile')}>Ph????ng th???c thanh to??n</div>
            <div className={cx('footer-title-text-mobile')}>Thanh to??n khi nh???n h??ng</div>
          </div>
          <div className={cx('footer-list')}>
            <p className={cx('footer-item')}>T???ng ti???n h??ng</p>
            <p className={cx('footer-item')}>
              {totalMoney && totalMoney.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}??
            </p>
          </div>
          <div className={cx('footer-list')}>
            <p className={cx('footer-item')}>Ph?? v???n chuy???n</p>
            <p className={cx('footer-item')}>
              {transports &&
                transports.length > 0 &&
                transports[0].price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
            </p>
          </div>
        </div>
        <div className={cx('footer-mobile')}>
          <div className={cx('footer-list')}>
            <p className={cx('footer-item-mobile')}>
              T???ng c???ng:{' '}
              <span>
                {totalMoney && transports && transports.length > 0
                  ? (totalMoney + transports[0].price).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
                  : totalMoney.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                ??
              </span>
            </p>
          </div>
          {!validate ? (
            <Button className={cx('checkout-btn-mobile')} primary fill onClick={handleBuy}>
              ?????t h??ng
            </Button>
          ) : (
            <Button className={cx('checkout-btn-mobile')} primary disable fill onClick={handleBuy}>
              ?????t h??ng
            </Button>
          )}
        </div>
      </div>
    );
  }
  return body;
}

export default Checkout;
