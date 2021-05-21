import React, { Component } from 'react';

import './home.css'

export class Home extends Component {
  static displayName = Home.name;
  
  constructor() {
      super();
      this.state = {
          input: "",
      }
  }

  render () {
    return (
      <div>
        <h1>Hello!</h1>
        <p>Enter URLs:</p>
        <div className={"form-row"}>
          <textarea className={"input-group-text"} rows={"3"} onInput={this.handleInput.bind(this)}/>
          <button className={"btn-dark"} type={"submit"} onClick={this.submitInput.bind(this)}>Submit</button>
        </div>
      </div>
    );
  }
  
  //TODO: Parsing using back or front???
  
  handleInput(e) {
      this.setState({input: e.target.value});
      e.target.style.height = "1px";
      e.target.style.height = `${e.target.scrollHeight}px`;
  }
  
  submitInput() {
      const urls = this.state.input.split("\n");
      console.log("loading..");
      
      fetch(`main?url=${urls[0]}`)
          .then(response => response.json())
          .then(json => console.log(json));
  }
}
