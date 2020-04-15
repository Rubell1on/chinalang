import _regeneratorRuntime from 'babel-runtime/regenerator';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var LoginForm = function (_React$Component) {
    _inherits(LoginForm, _React$Component);

    function LoginForm(props) {
        var _this2 = this;

        _classCallCheck(this, LoginForm);

        var _this = _possibleConstructorReturn(this, (LoginForm.__proto__ || Object.getPrototypeOf(LoginForm)).call(this, props));

        _this.onInputChange = function (event, field) {
            _this.setState(_defineProperty({}, field, event.target.value));
        };

        _this.onSubmit = function () {
            var _ref = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee(event) {
                var res, role, courseRoute;
                return _regeneratorRuntime.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                event.preventDefault();
                                _context.next = 3;
                                return request.get('/login', _this.state).catch(function (e) {
                                    console.log(e);
                                    notificationController.error(e.error.responseText);
                                });

                            case 3:
                                res = _context.sent;

                                if (res.status === 'success') {
                                    role = res.response.role;

                                    auth.setData(res.response);

                                    courseRoute = role === 'student' ? 'main' : 'users';


                                    location.href = location.origin + '/dashboard/' + courseRoute;
                                }
                                console.log(_this.state);

                            case 6:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, _this2);
            }));

            return function (_x) {
                return _ref.apply(this, arguments);
            };
        }();

        _this.state = {
            username: '',
            password: ''
        };
        return _this;
    }

    _createClass(LoginForm, [{
        key: 'render',
        value: function render() {
            var _this3 = this;

            return React.createElement(
                'form',
                { className: 'form ' + this.props.className, action: '', onSubmit: this.onSubmit },
                React.createElement(CustomInput, { type: 'text', label: '\u041B\u043E\u0433\u0438\u043D', onChange: function onChange(e) {
                        return _this3.onInputChange(e, 'username');
                    } }),
                React.createElement(CustomInput, { type: 'password', label: '\u041F\u0430\u0440\u043E\u043B\u044C', onChange: function onChange(e) {
                        return _this3.onInputChange(e, 'password');
                    } }),
                React.createElement(CustomButton, { className: 'button_justified button_big button_color_red', value: '\u041E\u0442\u043F\u0440\u0430\u0432\u0438\u0442\u044C' })
            );
        }
    }]);

    return LoginForm;
}(React.Component);