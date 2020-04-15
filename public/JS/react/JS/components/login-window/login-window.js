function LoginWindow(props) {
    return React.createElement(
        Overlay,
        { onBackgroundClick: props.backgroundClick },
        React.createElement(WindowHeader, { key: "header", className: "", value: "\u0410\u0432\u0442\u043E\u0440\u0438\u0437\u0430\u0446\u0438\u044F" }),
        React.createElement(LoginForm, { key: "login-form", className: "login-form" })
    );
}