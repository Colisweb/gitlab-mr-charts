[%raw "require('./loader.css')"];

let component = ReasonReact.statelessComponent("Loader");

let make = _children => {
  ...component,
  render: _self =>
    <div className="lds-ring"> <div /> <div /> <div /> <div /> </div>,
};

let default =
  ReasonReact.wrapReasonForJs(~component, props => make(props##children));