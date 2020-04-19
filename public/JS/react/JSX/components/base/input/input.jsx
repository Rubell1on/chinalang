export function CustomInput (props) {
    return (
        <div className="input-block">
            <label className="input-label" htmlFor={props.type}>{props.label}</label>
            <input key={props.inputKey} className="input-field" type={props.type} name={props.type} placeholder={props.placeholder} onChange={props.onChange} required={props.required}/>
        </div>
    )
}