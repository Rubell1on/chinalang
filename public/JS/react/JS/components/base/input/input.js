export function CustomInput(props) {
  return /*#__PURE__*/React.createElement("div", {
    className: "input-block"
  }, /*#__PURE__*/React.createElement("label", {
    className: "input-label",
    htmlFor: 'input_' + props.label
  }, props.label), /*#__PURE__*/React.createElement("input", {
    className: "input-field",
    type: props.type,
    name: 'input_' + props.label,
    placeholder: props.placeholder,
    onChange: props.onChange,
    required: props.required
  }));
}