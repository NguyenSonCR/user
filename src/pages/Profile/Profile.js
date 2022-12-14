import classNames from 'classnames/bind';
import { useContext, useEffect, useState } from 'react';
import Button from '~/components/Button';
import { AuthContext } from '~/contexts/AuthContext';
import { ProductContext } from '~/contexts/ProductContext';
import { ToastContext } from '~/contexts/ToastContext';
import styles from './Profile.module.scss';
import NaviMobi from '~/layouts/components/NaviMobi';

const cx = classNames.bind(styles);

function Profile() {
  const width = window.innerWidth > 0 ? window.innerWidth : window.screen.width;
  const {
    authState: { user },
    updatedUser,
    changePassword,
    chooseNavigation,
  } = useContext(AuthContext);
  const { username, img, fullName } = user;
  const { uploadFile } = useContext(ProductContext);

  useEffect(() => {
    chooseNavigation('user');
    // eslint-disable-next-line
  }, []);

  const {
    toastState: { toastList },
    addToast,
  } = useContext(ToastContext);
  const [avatar, setAvatar] = useState();
  const [file, setFile] = useState();

  useEffect(() => {
    return () => {
      avatar && URL.revokeObjectURL(avatar.preview);
    };
  });
  const handlePreviewAvatar = (event) => {
    const file = event.target.files[0];
    file.preview = URL.createObjectURL(file);
    setAvatar(file);
    setFile(file);
  };

  function uuidv4() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
      (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16),
    );
  }
  const handleUploadFile = async () => {
    let dataSingle = new FormData();

    const imgId = uuidv4();
    const blob = file.slice(0, file.size, 'image/jpeg');
    const newFile = new File([blob], `${imgId}_product.jpeg`, { type: 'image/jpeg' });
    dataSingle.append('file', newFile);

    try {
      const response = await uploadFile(dataSingle);
      return response;
    } catch (error) {
      console.log(error);
    }
  };

  const handleChangeAvatar = async (event) => {
    event.preventDefault();
    if (!file) return;
    try {
      const response = await handleUploadFile();
      if (response.success) {
        const res = await updatedUser({
          username,
          img: response.result,
        });
        if (res.success) {
          addToast({
            id: toastList.length + 1,
            title: 'Th??nh c??ng',
            content: '?????i ???nh ?????i di???n th??nh c??ng',
            type: 'success',
          });
          setAvatar();
          setFile();
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const [model, setModel] = useState(false);
  const [formValue, setFormValue] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const { oldPassword, newPassword, confirmPassword } = formValue;

  const handelOnchange = (event) => {
    setFormValue({
      ...formValue,
      [event.target.name]: event.target.value,
    });
  };

  const [warning, setWarning] = useState({
    warningOldPassword: false,
    warningNewPassword: false,
    warningConfirmPassword: false,
  });

  const handleChangePassword = async (event) => {
    event.preventDefault();

    if (oldPassword === '' && newPassword === '' && confirmPassword === '') {
      setWarning({
        warningOldPassword: 'B???n ch??a nh???p tr?????ng n??y',
        warningNewPassword: 'B???n ch??a nh???p tr?????ng n??y',
        warningConfirmPassword: 'B???n ch??a nh???p tr?????ng n??y',
      });
      return;
    } else if (oldPassword === '' && newPassword !== '' && confirmPassword !== '') {
      setWarning({
        ...warning,
        warningOldPassword: 'B???n ch??a nh???p tr?????ng n??y',
      });
      return;
    } else if (oldPassword !== '' && newPassword === '' && confirmPassword !== '') {
      setWarning({
        ...warning,
        warningNewPassword: 'B???n ch??a nh???p tr?????ng n??y',
      });
      return;
    } else if (oldPassword !== '' && newPassword !== '' && confirmPassword === '') {
      setWarning({
        ...warning,
        warningConfirmPassword: 'B???n ch??a nh???p tr?????ng n??y',
      });
      return;
    }
    if (oldPassword === '' || newPassword === '' || confirmPassword === '') {
      return;
    }

    if (newPassword !== confirmPassword) {
      setWarning({
        ...warning,
        warningConfirmPassword: 'M???t kh???u m???i kh??ng tr??ng nhau',
      });
      return;
    }
    try {
      const response = await changePassword({
        ...formValue,
        username,
      });
      if (response.success) {
        addToast({
          id: toastList.length + 1,
          title: 'Th??nh c??ng',
          content: response.message,
          type: 'success',
        });
        setWarning(false);
        setFormValue({
          oldPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        setModel(false);
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

  return (
    <div className={cx('wrapper')}>
      <div className={cx('info')}>
        <div className={cx('password')}>
          <p className={cx('text')}> T??n ng?????i d??ng: {fullName} </p>
          <Button primary onClick={() => setModel(true)}>
            ?????i m???t kh???u
          </Button>
          {model && (
            <div className={cx('model')}>
              <form onSubmit={handleChangePassword}>
                <div className={cx('form-group')}>
                  <label className={cx('form-label')}>Nh???p m???t kh???u c??</label>
                  <input
                    className={cx('form-input')}
                    onChange={handelOnchange}
                    onFocus={() => setWarning({ ...warning, warningOldPassword: false })}
                    name="oldPassword"
                    value={oldPassword}
                    type={'password'}
                    autoComplete={'true'}
                  ></input>
                  {warning.warningOldPassword && (
                    <span className={cx('form-warning')}>{warning.warningOldPassword}</span>
                  )}
                </div>
                <div className={cx('form-group')}>
                  <label className={cx('form-label')}> Nh???p m???t kh???u m???i</label>
                  <input
                    className={cx('form-input')}
                    onChange={handelOnchange}
                    name="newPassword"
                    onFocus={() => setWarning({ ...warning, warningNewPassword: false })}
                    value={newPassword}
                    type={'password'}
                    autoComplete={'true'}
                  ></input>
                  {warning.warningNewPassword && (
                    <span className={cx('form-warning')}>{warning.warningNewPassword}</span>
                  )}
                </div>
                <div className={cx('form-group')}>
                  <label className={cx('form-label')}> Nh???p l???i m???t kh???u m???i</label>
                  <input
                    onChange={handelOnchange}
                    name="confirmPassword"
                    onFocus={() => setWarning({ ...warning, warningConfirmPassword: false })}
                    value={confirmPassword}
                    type={'password'}
                    className={cx('form-input')}
                    autoComplete={'true'}
                  ></input>
                  {warning.warningConfirmPassword && (
                    <span className={cx('form-warning')}>{warning.warningConfirmPassword}</span>
                  )}
                </div>
                <div className={cx('form-btn')}>
                  <Button
                    primary
                    onClick={(event) => {
                      event.preventDefault();
                      setModel(false);
                    }}
                    className={cx('back')}
                  >
                    H???y
                  </Button>
                  <Button primary type="submit">
                    L??u l???i
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
        <p className={cx('text')}>???nh ?????i di???n: </p>
        <div>
          <form onSubmit={handleChangeAvatar}>
            <label htmlFor="avatar" className={cx('label-avatar')}>
              {avatar || img ? <span></span> : <span className={cx('choose-avatar')}>Ch???n ???nh ?????i di???n</span>}
              {((avatar && avatar.preview) || img) && (
                <img
                  className={cx('avatar')}
                  src={avatar && avatar.preview ? avatar.preview : img}
                  alt={username}
                ></img>
              )}
            </label>
            <input type="file" hidden id="avatar" onChange={handlePreviewAvatar}></input>

            <Button primary type="submit">
              L??u l???i
            </Button>
          </form>
        </div>
      </div>
      {width < 740 && <NaviMobi />}
    </div>
  );
}

export default Profile;
