import { Overlay } from '../../../JS/components/overlay/overlay.js';
import { Header } from '../../../JS/components/base/header/header.js';
import { CustomButton } from '../../../JS/components/base/button/button.js';
export function YesNoWindow(props) {
  return (
    /*#__PURE__*/
    React.createElement(Overlay, null,
    /*#__PURE__*/
    React.createElement(Header, {
      key: "header",
      className: "",
      value: props.header
    }),
    /*#__PURE__*/
    React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "row",
        width: "fit-content",
        margin: "0 auto"
      }
    },
    /*#__PURE__*/
    React.createElement(CustomButton, {
      className: "button_small button_color_red",
      value: "\u0414\u0430",
      onClick: props.onYes
    }),
    /*#__PURE__*/
    React.createElement(CustomButton, {
      className: "button_small button_color_red",
      value: "\u041D\u0435\u0442",
      onClick: props.onNo
    })))
  );
}