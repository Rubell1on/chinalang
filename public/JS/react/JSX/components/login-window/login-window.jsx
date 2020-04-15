function LoginWindow (props) {
    return (
        <Overlay onBackgroundClick={props.backgroundClick}>
            <WindowHeader key="header" className="" value="Авторизация"/>
            <LoginForm key="login-form" className="login-form"/>
        </Overlay>
    )
}