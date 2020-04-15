var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Header = function (_React$Component) {
    _inherits(Header, _React$Component);

    function Header(props) {
        _classCallCheck(this, Header);

        return _possibleConstructorReturn(this, (Header.__proto__ || Object.getPrototypeOf(Header)).call(this, props));
    }

    _createClass(Header, [{
        key: "render",
        value: function render() {
            return React.createElement(
                "div",
                { className: "header" },
                React.createElement(
                    "a",
                    { href: "/" },
                    React.createElement(
                        "div",
                        { className: "logo" },
                        React.createElement("img", { className: "logo-label", src: "../public/IMG/header/chinalang_label.png" }),
                        React.createElement("img", { className: "logo-img", src: "../public/IMG/header/triangle_logo.png" })
                    )
                ),
                React.createElement(HeaderControls, { onLogin: this.props.onLogin, onContacts: this.props.onContacts })
            );
        }
    }]);

    return Header;
}(React.Component);

function HeaderControls(props) {
    return React.createElement(
        "div",
        { className: "header-controls" },
        React.createElement(
            "div",
            { className: "button-small login", type: "button", onClick: props.onLogin },
            "\u0412\u043E\u0439\u0442\u0438"
        ),
        React.createElement(
            "div",
            { className: "button-small contacts", type: "button", onClick: props.onContacts },
            "\u041A\u043E\u043D\u0442\u0430\u043A\u0442\u044B"
        )
    );
}

var CustomPage = function (_React$Component2) {
    _inherits(CustomPage, _React$Component2);

    function CustomPage(props) {
        _classCallCheck(this, CustomPage);

        var _this2 = _possibleConstructorReturn(this, (CustomPage.__proto__ || Object.getPrototypeOf(CustomPage)).call(this, props));

        _this2.addComponent = function (e, component) {
            var temp = [].concat(_toConsumableArray(_this2.children));
            temp.push(component);
            _this2.children = temp;
            _this2.setState({ children: temp });
        };

        _this2.removeComponent = function (e, component) {
            var temp = [].concat(_toConsumableArray(_this2.children));
            var i = temp.indexOf(component);
            temp.splice(i, 1);
            _this2.children = temp;
            _this2.setState({ children: temp });
        };

        _this2.loginWindow = React.createElement(LoginWindow, { backgroundClick: function backgroundClick(e) {
                return _this2.removeComponent(e, _this2.loginWindow);
            } });
        _this2.children = [];
        _this2.state = {
            children: _this2.children
        };
        return _this2;
    }

    _createClass(CustomPage, [{
        key: "render",
        value: function render() {
            var _this3 = this;

            var temp = this.children;
            return React.createElement(
                "div",
                { className: "wrapper" },
                React.createElement(
                    "div",
                    null,
                    this.state.children
                ),
                React.createElement(Header, { onLogin: function onLogin(e) {
                        return _this3.addComponent(e, _this3.loginWindow);
                    } })
            );
        }
    }]);

    return CustomPage;
}(React.Component);

ReactDOM.render(React.createElement(CustomPage, null), document.querySelector('.app-wrapper'));