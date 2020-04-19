import { Overlay } from '../../../JS/components/overlay/overlay.js';
import { WindowHeader } from '../../../JS/components/base/header/header.js';
import { LoginForm } from '../../../JS/components/login-form/login-form.js';

export function LoginWindow (props) {
    return (
        <Overlay customStyle={{width: "300px"}} onBackgroundClick={props.backgroundClick}>
            <WindowHeader key="header" className="" value="Авторизация"/>
            <LoginForm key="login-form" className="login-form"/>
        </Overlay>
    )
}