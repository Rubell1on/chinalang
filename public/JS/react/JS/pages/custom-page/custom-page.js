var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var CustomPage = function (_React$Component) {
    _inherits(CustomPage, _React$Component);

    function CustomPage(props) {
        _classCallCheck(this, CustomPage);

        var _this = _possibleConstructorReturn(this, (CustomPage.__proto__ || Object.getPrototypeOf(CustomPage)).call(this, props));

        _this.addComponent = function (e, component) {
            console.log(_this.state.children);
            _this.tempChildren.push(component);
            _this.setState({ children: _this.tempChildren });
        };

        _this.removeComponent = function (e, component) {
            var i = _this.tempChildren.indexOf(component);
            if (i !== -1) {
                _this.tempChildren.splice(i, 1);
                _this.setState({ children: _this.tempChildren });
            }
        };

        _this.login = React.createElement(LoginWindow, { backgroundClick: function backgroundClick(e) {
                return _this.removeComponent(e, _this.login);
            } });
        // this.yesNoWindow = <YesNoWindow header="Вы уверены" onYes={e => [this.yesNoWindow, this.login].forEach(el => this.removeComponent(e, el))} onNo={e => this.removeComponent(e, this.yesNoWindow)}/>
        _this.tempChildren = [React.createElement(CustomButton, { className: "button_medium button_color_blue button_bold", value: "\u041B\u043E\u0433\u0438\u043D", onClick: function onClick(e) {
                return _this.addComponent(e, _this.login);
            } })];

        _this.state = {
            children: _this.tempChildren
        };
        return _this;
    }

    _createClass(CustomPage, [{
        key: "componentDidMount",
        value: function componentDidMount() {
            console.log(this.login);
            // this.tempChildren.push(this.login);
            // this.setState({children: this.tempChildren})
        }
    }, {
        key: "render",
        value: function render() {
            return React.createElement(
                "div",
                { className: "page " + this.props.className },
                this.state.children
            );
        }
    }]);

    return CustomPage;
}(React.Component);

// ReactDOM.render(<CustomPage/>, document.querySelector('.app-wrapper'));