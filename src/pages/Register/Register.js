import classNames from 'classnames/bind';
import styles from './Register.module.scss';
import config from '~/config';
import { useState, useContext } from 'react';
import { AuthContext } from '~/contexts/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Spinner from '~/components/Spinner';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import images from '~/assets/img';

import { Link } from 'react-router-dom';
import Button from '~/components/Button';
import { ToastContext } from '~/contexts/ToastContext';
import Toast from '~/components/Toast';
import { validation, setOnFocus } from '~/utils/validation';

const cx = classNames.bind(styles);

function Login() {
  const width = window.innerWidth > 0 ? window.innerWidth : window.screen.width;
  const [formValue, setFormValue] = useState({
    username: '',
    password: '',
    fullName: '',
    passwordConfirm: '',
  });
  const [show, setShow] = useState({
    type: 'password',
  });

  const [showConfirm, setShowConfirm] = useState({
    type: 'password',
  });
  const {
    registerUser,
    authState: { authLoading, isAuthenticated },
    signInWithGoogle,
    signInWithFaceBook,
  } = useContext(AuthContext);

  const { username, fullName, password, passwordConfirm } = formValue;
  const onClickIcon = () => {
    if (show.type === 'password') {
      setShow({ type: 'text' });
    } else {
      setShow({ type: 'password' });
    }
  };

  const onClickIconConfirm = () => {
    if (showConfirm.type === 'password') {
      setShowConfirm({ type: 'text' });
    } else {
      setShowConfirm({ type: 'password' });
    }
  };

  const {
    toastState: { toastList },
    addToast,
  } = useContext(ToastContext);

  // validate
  const [formValid, setFormValid] = useState({
    usernameBlur: null,
    fullNameBlur: null,
    passwordBlur: null,
    passwordConfirmBlur: null,
    fullNameValid: null,
    passwordConfirmValid: null,
    usernameValid: null,
    passwordValid: null,
    formErrors: { username: '', fullName: '', password: '', passwordConfirm: '' },
  });

  const {
    formErrors,
    usernameValid,
    usernameBlur,
    passwordBlur,
    fullNameBlur,
    passwordConfirmBlur,
    fullNameValid,
    passwordConfirmValid,
    passwordValid,
  } = formValid;

  const setOnBlur = (event) => {
    switch (event.target.name) {
      case 'username':
        setFormValid({
          ...formValid,
          usernameBlur: true,
        });

        break;

      case 'fullName':
        setFormValid({
          ...formValid,
          fullNameBlur: true,
        });
        break;
      case 'password':
        setFormValid({
          ...formValid,
          passwordBlur: true,
        });
        break;

      case 'passwordConfirm':
        setFormValid({
          ...formValid,
          passwordConfirmBlur: true,
        });
        break;
      default:
        break;
    }
  };

  const onChangeForm = (event) => {
    setFormValue({
      ...formValue,
      [event.target.name]: event.target.value,
    });
    validation(event.target.name, event.target.value, setFormValid, formValid, password);
  };

  let navigate = useNavigate();

  const register = async (event) => {
    event.preventDefault();

    if (password !== passwordConfirm) {
      addToast({
        id: toastList.length + 1,
        title: 'Th???t b???i',
        content: 'M???t kh???u kh??ng tr??ng nhau',
        type: 'error',
      });
      return;
    } else {
      try {
        const loginData = await registerUser(formValue);
        if (loginData.success) {
          addToast({
            id: toastList.length + 1,
            title: 'Th??nh c??ng',
            content: loginData.message,
            type: 'success',
          });
          navigate(config.routes.home, { replace: true });
        } else {
          addToast({
            id: toastList.length + 1,
            title: 'Th???t b???i',
            content: loginData.message,
            type: 'error',
          });
        }
      } catch (error) {
        console.log(error);
      }
    }
  };
  if (authLoading) {
    return <Spinner />;
  } else if (isAuthenticated) {
    return <Navigate to={config.routes.home} />;
  } else {
    return (
      <div className={cx('wrapper', ['grid', 'wide'])}>
        <Toast />
        <div className={cx('header')}>
          <div className={cx('inner')}>
            <div className={cx('logo-wrapper')}>
              <div className={cx('logo-wrapper-link')}>
                <Link className={cx('logo')} to={config.routes.home}>
                  <img src={images.logo} alt="logo" className={cx('logo-img')}></img>
                </Link>
                <Link to={config.routes.home} className={cx('logo-text-title')}>
                  Nh???t B??nh Shop
                </Link>
              </div>
              <p className={cx('logo-text')}>????ng Nh???p</p>
            </div>
          </div>
        </div>

        <div className={cx('content')}>
          <div className={cx('form')}>
            <div className={cx('title')}>
              <h3> ????ng k?? </h3>
            </div>
            <form className={cx('form-content')} id="form-register" onSubmit={register}>
              <div className={cx('form-group')}>
                {/* <label htmlFor="username" className={cx('label')}>
                  T??n ????ng nh???p:
                </label> */}
                <input
                  onFocus={(event) => setOnFocus(event, setFormValid, formValid, password)}
                  onBlur={setOnBlur}
                  spellCheck={false}
                  value={username}
                  type={'text'}
                  id="username"
                  className={cx('input', usernameBlur && formErrors.username && 'error')}
                  name={'username'}
                  onChange={onChangeForm}
                  placeholder="T??n ????ng nh???p"
                ></input>
                <span className={cx('form-message')}>{usernameBlur && formErrors.username}</span>
              </div>
              <div className={cx('form-group')}>
                {/* <label htmlFor="fullName" className={cx('label')}>
                  H??? t??n:
                </label> */}
                <input
                  onFocus={(event) => setOnFocus(event, setFormValid, formValid, password)}
                  onBlur={setOnBlur}
                  value={fullName}
                  spellCheck={false}
                  type={'text'}
                  id="fullName"
                  className={cx('input', fullNameBlur && formErrors.fullName && 'error')}
                  name={'fullName'}
                  onChange={onChangeForm}
                  placeholder="H??? t??n"
                ></input>
                <span className={cx('form-message')}>{fullNameBlur && formErrors.fullName}</span>
              </div>

              <div className={cx('form-group')}>
                {/* <label htmlFor="password" className={cx('label')}>
                  M???t kh???u:
                </label> */}
                <div className={cx('form-password')}>
                  <div className={cx('input-password', passwordBlur && !passwordValid && 'error')}>
                    <input
                      onFocus={(event) => setOnFocus(event, setFormValid, formValid, password)}
                      onBlur={setOnBlur}
                      className={cx('password')}
                      value={password}
                      type={show.type}
                      id="password"
                      name={'password'}
                      placeholder="Nh???p m???t kh???u"
                      onChange={onChangeForm}
                      autoComplete="true"
                    />
                    <div>
                      {show.type === 'password' ? (
                        <FontAwesomeIcon
                          icon={faEyeSlash}
                          className={cx('icon')}
                          onClick={onClickIcon}
                        ></FontAwesomeIcon>
                      ) : (
                        <FontAwesomeIcon icon={faEye} onClick={onClickIcon} className={cx('icon')}></FontAwesomeIcon>
                      )}
                    </div>
                  </div>
                  <div className={cx('input-passwordConfirm', passwordConfirmBlur && !passwordConfirmValid && 'error')}>
                    <input
                      onFocus={(event) => setOnFocus(event, setFormValid, formValid, password)}
                      onBlur={setOnBlur}
                      className={cx('password')}
                      value={passwordConfirm}
                      type={showConfirm.type}
                      id="passwordConfirm"
                      name={'passwordConfirm'}
                      placeholder="Nh???p l???i m???t kh???u"
                      onChange={onChangeForm}
                      autoComplete="true"
                    />

                    <div>
                      {showConfirm.type === 'password' ? (
                        <FontAwesomeIcon
                          icon={faEyeSlash}
                          className={cx('icon')}
                          onClick={onClickIconConfirm}
                        ></FontAwesomeIcon>
                      ) : (
                        <FontAwesomeIcon
                          icon={faEye}
                          onClick={onClickIconConfirm}
                          className={cx('icon')}
                        ></FontAwesomeIcon>
                      )}
                    </div>
                  </div>
                </div>
                <span className={cx('form-message')}>{passwordBlur && formErrors.password}</span>
                <span className={cx('form-message')}>{passwordConfirmBlur && formErrors.passwordConfirm}</span>
              </div>

              <div className={cx('button', width < 740 && 'mobile')}>
                <Button to={config.routes.login} className={cx('btn-back', width < 740 && 'mobile')} primary>
                  Quay l???i
                </Button>
                {usernameValid && fullNameValid && passwordValid && passwordConfirmValid ? (
                  <Button type="submit" primary fill className={cx('btn-back', width < 740 && 'mobile')}>
                    ????ng k??
                  </Button>
                ) : (
                  <Button primary disable className={cx('btn-register', width < 740 && 'mobile')}>
                    ????ng k??
                  </Button>
                )}
              </div>

              <div>
                <p className={cx('or')}>HO???C ????NG NH???P V???I</p>
              </div>
              <div className={cx('social')}>
                <div className={cx('social-list')} onClick={signInWithGoogle}>
                  <img className={cx('social-icon')} src={images.google} alt="" />
                  <span>Google</span>
                </div>
                <div className={cx('social-list')} onClick={signInWithFaceBook}>
                  <img className={cx('social-icon')} src={images.facebook} alt="" />
                  <span>Facebook</span>
                </div>
              </div>
              <div className={cx('change')}>
                <p className={cx('change-text')}>B???n ???? c?? t??i kho???n?</p>
                <Button to={config.routes.login} primary>
                  ????ng nh???p
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

export default Login;
