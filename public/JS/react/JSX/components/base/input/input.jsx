export function CustomInput (props) {
    return (
        <div className="input-block">
            <label className="input-label" htmlFor={'input_' + props.label}>{props.label}</label>
            <input key={props.inputKey} className="input-field" type={props.type} name={'input_'+ props.label} placeholder={props.placeholder} onChange={props.onChange} required={props.required}/>
        </div>
    )
}