export function CustomBackground(props) {
  return (
    /*#__PURE__*/
    React.createElement("div", {
      className: `background ${props.className}`,
      onClick: props.onClick
    })
  );
}