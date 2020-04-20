export function CustomButton(props) {
  return (
    /*#__PURE__*/
    React.createElement("input", {
      type: props.type,
      className: `button ${props.className}`,
      value: props.value,
      onClick: props.onClick
    })
  );
}