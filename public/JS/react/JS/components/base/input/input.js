export function CustomInput(props) {
  return (
    /*#__PURE__*/
    React.createElement("div", {
      className: "input-block"
    },
    /*#__PURE__*/
    React.createElement("label", {
      className: "input-label",
      htmlFor: props.type
    }, props.label),
    /*#__PURE__*/
    React.createElement("input", {
      key: props.inputKey,
      className: "input-field",
      type: props.type,
      name: props.type,
      placeholder: props.placeholder,
      onChange: props.onChange,
      required: props.required
    }))
  );
}