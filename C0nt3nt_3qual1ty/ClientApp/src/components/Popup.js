import React, {Component} from 'react';
import {BsXCircle} from "react-icons/all";

import './popup.css';

export class Popup extends Component {
  
  render() {
    return (
      <div className={`popup ${this.props.active ? "active" : ""}`}>
        <div className={"popupHeader"}>
          <p>INFO:</p>
          <button onClick={this.props.hidePopup}><BsXCircle/></button>
        </div>
        {this.props.children}
      </div>
    )
  };
}