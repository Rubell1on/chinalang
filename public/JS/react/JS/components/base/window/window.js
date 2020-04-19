export function ReactWindow(props) {
  return (
    /*#__PURE__*/
    React.createElement("div", {
      style: props.customStyle,
      className: `window ${props.className}`
    }, props.children)
  );
}