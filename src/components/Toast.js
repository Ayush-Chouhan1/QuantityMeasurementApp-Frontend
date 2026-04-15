import React from 'react';

function Toast(props) {
  return (
    <div id="toast" className={props.show ? 'show ' + props.type : props.type}>
      {props.message}
    </div>
  );
}

export default Toast;
