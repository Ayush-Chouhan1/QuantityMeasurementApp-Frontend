import React from 'react';

type ToastProps = {
  message: string;
  show: boolean;
  type: 'success' | 'error';
};

function Toast(props: ToastProps) {
  return (
    <div id="toast" className={props.show ? 'show ' + props.type : props.type}>
      {props.message}
    </div>
  );
}

export default Toast;