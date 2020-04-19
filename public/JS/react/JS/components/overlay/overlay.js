import { CustomBackground } from '../../../JS/components/base/background/background.js';
import { ReactWindow } from '../../../JS/components/base/window/window.js';
export class Overlay extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      /*#__PURE__*/
      React.createElement("div", {
        className: `overlay ${this.props.className}`
      },
      /*#__PURE__*/
      React.createElement(CustomBackground, {
        className: "overlay__background",
        onClick: this.props.onBackgroundClick
      }),
      /*#__PURE__*/
      React.createElement(ReactWindow, {
        customStyle: this.props.customStyle,
        className: "overlay__window window_centered"
      }, this.props.children))
    );
  }

}