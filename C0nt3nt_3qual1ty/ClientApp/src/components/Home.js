import React, { Component } from 'react';

import './home.css'

export class Home extends Component {
  static displayName = Home.name;
  
  constructor() {
      super();
      this.state = {
          equality: 0,
          inputUrls: "",
          buttonDisabled: false,
          selectorDisabled: true,
          selectorClass: "",
          selectedPage: null,
          pages: [
              {
                  Id: 1,
                  Url: "loading..",
                  Equality: 0,
              }
          ],
      }
  }
  
  async componentDidMount() {
      let dbPages = await this.getPages();
      if (dbPages.length === 0) {
          dbPages = [
              {
                  Id: 1,
                  Url: "No pages",
                  Equality: 0,
              }
          ]
      }
      const configEquality = parseInt(await ((await fetch(`main/GetEquality`)).json()));
      this.setState({
          equality: configEquality,
          selectorDisabled: dbPages.length === 0,
          pages: dbPages,
      });
      await this.handleSelectorChange();
  }

  render () {
    return (
      <div>
        <h1>Hello!</h1>
        <div className={"form-row"}>
          <p>Add URLs:</p>
          <textarea className={"input-group-text"} rows={"3"} onInput={this.handleInput.bind(this)}/>
          <button className={"btn-dark"} type={"submit"} onClick={this.submitInput.bind(this)} disabled={this.state.buttonDisabled}>Submit</button>
        </div>
        <div>
          <select id={"selector"} disabled={this.state.selectorDisabled} className={this.state.selectorClass} onChange={this.handleSelectorChange.bind(this)}>
              {this.state.pages.map(page => (
                  <option key={page.Id} className={page.Equality > this.state.equality ? "sufficient" : "insufficient"}>{page.Url}</option>
              ))}
          </select>
          <textarea id={"editor"} className={"input-group-text"} rows={"7"} disabled={this.state.selectorDisabled}/>
        </div>
      </div>
    );
  }
  
  async getPages() {
      return await ((await fetch(`main`)).json());
  }
  
  async handleInput(e) {
      this.setState({inputUrls: e.target.value});
      e.target.style.height = "1px";
      e.target.style.height = `${e.target.scrollHeight}px`;
  }
  
  async submitInput() {
      const urls = this.state.inputUrls.split("\n");
      
      // Example below!
      // const content = {
      //     Url: urls[0],
      // }
      // body: JSON.stringify(content)
      
      console.log("loading..");
      this.setState({buttonDisabled: true})
      
      const json = await ((await fetch(`main`, {
          method: "POST",
          body: JSON.stringify(urls),
          headers: {
              'Content-Type': 'application/json',
          },
      })).json());
      console.log(json);
      this.setState({
          buttonDisabled: false,
          pages: await this.getPages(),
      });
  }
  
  async handleSelectorChange() {
      const selector = document.querySelector("#selector");
      const optionClass = selector.options[selector.selectedIndex].className;
      this.setState({
          selectorClass: optionClass,
          selectedPage: this.state.pages[selector.selectedIndex],
      });
      const editor = document.querySelector("#editor");
      editor.value = this.state.pages[selector.selectedIndex].Text;
  }
}
