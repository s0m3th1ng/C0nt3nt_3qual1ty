import React, { Component } from 'react';
import SlateEditor, {loseFocus} from './SlateEditor';

import './home.css'
import {ContentTable} from "./ContentTable";
import {Popup} from "./Popup";

export class Home extends Component {
    
  static displayName = Home.name;
  
  slateInitialize = (text) => [
      {
          type: "paragraph",
          children: [{ text: text }],
      }
  ]
  
  constructor() {
      super();
      this.state = {
          characterCount: "loading translation limit..",
          inputUrls: "",
          buttonDisabled: true,
          buttonText: "Submit",
          popupContent: [],
          popupActive: false,
          loading: true,
          pages: [],
          editorValue: this.slateInitialize("Choose page to edit.."),
          editorDisabled: true,
      }
  }
  
  async componentDidMount() {
      let dbPages = await this.getPages();
      const count = await ((await fetch(`main/GetCharacterCount`)).json());
      this.setState({
          loading: false,
          characterCount: count,
          pages: dbPages,
      });
      console.log(dbPages);
  }

  render () {
    return (
      <div>
        <div className={"notesContainer"}>
          <div className={"notes"}>
            <h1>Hello!</h1>
            <div className={"translationLimit"}>
              <p>{this.state.characterCount}</p>
            </div>
            <p>Add URLs separated with line break (enter):</p>
          </div>
          <Popup active={this.state.popupActive} content={this.state.popupContent} hidePopup={this.hidePopup.bind(this)}/>
        </div>
        <div className={"form-row"}>
          <textarea id={"urlTextarea"} className={"input-group-text"} rows={"3"} onInput={this.handleUrlInput.bind(this)}/>
          <button className={"btn-dark"} type={"submit"} onClick={this.submitUrlInput.bind(this)} disabled={this.state.buttonDisabled}>
              {this.state.buttonText}
          </button>
        </div>
        <div>
          <div className={"tableContainer"}>
            <ContentTable
              pages={this.state.pages}
              loading={this.state.loading}
              editPage={this.editPage.bind(this)}
              translatePage={this.translatePage}
              downloadDoc={this.downloadDoc}
            />
          </div>
          <SlateEditor readonly={this.state.editorDisabled} value={this.state.editorValue} setValue={newValue => this.setState({editorValue: newValue})}/>
        </div>
      </div>
    );
  }
  
  async getPages() {
      return await ((await fetch(`main`)).json());
  }
  
  async handleUrlInput(e) {
      await this.handleTextareaChange(e.target);
  }
  
  async handleTextareaChange(target) {
      this.setState({
          inputUrls: target.value,
          buttonDisabled: !target.value.length,
      });
      target.style.height = "1px";
      target.style.height = `${target.scrollHeight}px`;
  }
  
  async submitUrlInput() {
      const urls = this.state.inputUrls.split("\n");
      const urlTextarea = document.querySelector("#urlTextarea");
      urlTextarea.disabled = true;  //Styles!
      
      // Example below!
      // const content = {
      //     Url: urls[0],
      // }
      // body: JSON.stringify(content)
      
      console.log("loading..");
      this.setState({
          buttonDisabled: true,
          buttonText: "Loading..",
      })
      
      const json = await ((await fetch(`main`, {
          method: "POST",
          body: JSON.stringify(urls),
          headers: {
              'Content-Type': 'application/json',
          },
      })).json());
      this.setState({
          inputUrls: "",
          characterCount: await ((await fetch(`main/GetCharacterCount`)).json()),
          buttonDisabled: false,
          buttonText: "Submit",
          popupContent: json,
          popupActive: true,
          pages: await this.getPages(),
      });
      urlTextarea.disabled = false;
      urlTextarea.value = "";
      await this.handleTextareaChange(urlTextarea);
  }
  
  async hidePopup() {
      this.setState({
          popupActive: false,
      });
      setTimeout(() => {
          this.setState({
              popupContent: [],
          })
      }, 500);
  }
  
  async editPage(text) {
      loseFocus();
      this.setState({
          editorValue: this.slateInitialize(text),
          editorDisabled: false,
      });
  }
  
  async translatePage(text) {
      
  }
  
  async downloadDoc() {
      
  }
}
