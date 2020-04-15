function CustomInput(props) {
    return React.createElement(
        "div",
        { className: "input-block" },
        React.createElement(
            "label",
            { className: "input-label", htmlFor: 'input_' + props.label },
            props.label
        ),
        React.createElement("input", { className: "input-field", type: props.type, name: 'input_' + props.label, placeholder: props.placeholder, onChange: props.onChange })
    );
}