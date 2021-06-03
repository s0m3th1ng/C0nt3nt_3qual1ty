import React, { Component } from 'react';

export class PopupUrlContent extends Component {
    
  render() {
    return (
      <div>
        <p className={"small"}><strong>Added urls:</strong> {this.calculateAddedUrls()}/{this.props.content.length}</p>
        <p className={"small"}><strong>Not added urls:</strong> {this.calculateNotAddedUrls()}/{this.props.content.length}</p>
        {this.containsErrors() &&
          <p className={"small"}><strong>List of not added urls:</strong> {this.getNotAddedUrls().map((url, index) => (
            <li key={index}>{url}</li>
          ))}</p>
        }
        {this.containsErrors() &&
          <p className={"small"}><strong>Common reasons:</strong> {this.getErrors().map((error, index) => (
            <li key={index}>{error}</li>
          ))}</p>
        }
      </div>
    );
  }
  
  containsErrors() {
      for (let url of this.props.content) {
          if (url.Error) {
              return true;
          }
      }
      return false;
  }

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