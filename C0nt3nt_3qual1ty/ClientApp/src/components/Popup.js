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
        <p className={"small"}>Added urls: {this.calculateAddedUrls()}</p>
        <p className={"small"}>Not added urls: {this.calculateNotAddedUrls()}</p>
        <p className={"small"}>List of not added urls: {this.getNotAddedUrls().map(url => (
            <li>{url}</li>
        ))}</p>
        <p className={"small"}>Common reasons: {this.getErrors().map(error => (
            <p>{error}</p>
        ))}</p>
      </div>
    )
  };
  
  calculateAddedUrls() {
      let added = 0;
      for (let url of this.props.content) {
          if (!url.Error) {
              added += 1;
          }
      }
      return added;
  }
  
  calculateNotAddedUrls() {
      let notAdded = 0;
      for (let url of this.props.content) {
          if (url.Error) {
              notAdded += 1;
          }
      }
      return notAdded;
  }
  
  getNotAddedUrls() {
      let urls = [];
      for (let url of this.props.content) {
          if (url.Error) {
              urls.push(url.Url);
          }
      }
      return urls;
  }
  
  getErrors() {
      let errors = [];
      for (let url of this.props.content) {
          if (!errors.includes(url.ErrorMessage)) {
              errors.push(url.ErrorMessage);
          }
      }
      return errors;
  }
}