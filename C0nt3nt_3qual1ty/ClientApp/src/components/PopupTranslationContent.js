import React, { Component } from 'react';

export class PopupTranslationContent extends Component {
  render() {
    return (
      <div>
        <p className={"small"}>{this.props.content}</p>
      </div>
    )
  }
}