import { Overlay } from '../../../JS/components/overlay/overlay.js';
import { WindowHeader } from '../../../JS/components/base/header/header.js';
import { LoginForm } from '../../../JS/components/login-form/login-form.js';
export function LoginWindow(props) {
  return (
    /*#__PURE__*/
    React.createElement(Overlay, {
      customStyle: {
        width: "300px"
      },
      onBackgroundClick: props.backgroundClick
    },
    /*#__PURE__*/
    React.createElement(WindowHeader, {
      key: "header",
      className: "",
      value: "\u0410\u0432\u0442\u043E\u0440\u0438\u0437\u0430\u0446\u0438\u044F"
    }),
    /*#__PURE__*/
    React.createElement(LoginForm, {
      formId: "1",
      inputKey: "login-form",
      className: "login-form"
    }))
  );
}