import React, { Component } from 'react';
import SlateEditor, { loseFocus, serialize, deserialize } from './SlateEditor';

import './home.css'
import {ContentTable} from "./ContentTable";
import {Popup} from "./Popup";
import {PopupUrlContent} from "./PopupUrlContent";
import {PopupTranslationContent} from "./PopupTranslationContent";

export class Home extends Component {
    
  static displayName = Home.name;
  
  constructor() {
      super();
      this.state = {
          characterCount: "loading translation limit..",
          inputUrls: "",
          urlButtonDisabled: true,
          buttonText: "Submit",
          popupContent: [],
          popupActive: false,
          popupDisplay: false,
          popupUrlActive: false,
          popupTranslateActive: false,
          loading: true,
          pages: [],
          editedPage: null,
          editorValue: [
              {
                  type: "paragraph",
                  children: [{ text: "Choose page to edit.." }],
              }
          ],
          editorDisabled: true,
          saveButtonDisabled: true,
          saveButtonText: "Save",
          translateButtonDisabled: true,
          translateButtonText: "Translate",
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
  }

  render () {
    return (
      <div>
        <div className={`notification ${this.state.popupActive && "notificationActive"} ${!this.state.popupDisplay && "notificationHidden"}`}>
          <Popup hidePopup={this.hidePopup.bind(this)}>
            {this.state.popupUrlActive && <PopupUrlContent content={this.state.popupContent}/>}
            {this.state.popupTranslateActive && <PopupTranslationContent content={this.state.popupContent}/>}
          </Popup>
        </div>
        <div className={"notesContainer"}>
          <div className={"notes"}>
            <h1>Hello!</h1>
            <div className={"translationLimit"}>
              <p>{this.state.characterCount}</p>
            </div>
            <p>Add URLs separated with line break (enter):</p>
          </div>
        </div>
        <div className={"form-row"}>
          <textarea id={"urlTextarea"} className={"input-group-text"} rows={"3"} onInput={this.handleUrlInput.bind(this)}/>
          <div className={"underTextarea"}>
          <button className={"btn-dark"} type={"submit"} onClick={this.submitUrlInput.bind(this)} disabled={this.state.urlButtonDisabled}>
              {this.state.buttonText}
          </button>
          <p>Notify when completed: </p>
          <input id={"email"} placeholder={"e-mail"}/>
          </div>
        </div>
        <div>
          <ContentTable
            pages={this.state.pages}
            resetPages={newPages => this.setState({pages: newPages})}
            loading={this.state.loading}
            editedPageId={this.state.editedPage == null ? -1 : this.state.editedPage.Id}
            editPage={this.editPage.bind(this)}
            downloadDoc={pageId => this.downloadDoc(pageId)}
          />
          <SlateEditor
            readonly={this.state.editorDisabled}
            value={this.state.editorValue}
            setValue={newValue => this.setState({editorValue: newValue, saveButtonDisabled: false})}
          />
          <div className="editorFooter">
            <button
              className={"btn-dark"}
              disabled={this.state.saveButtonDisabled}
              onClick={this.savePage.bind(this)}
            >
              {this.state.saveButtonText}
            </button>
            <button
              className={"btn-dark"}
              disabled={this.state.translateButtonDisabled}
              onClick={this.translatePage.bind(this)}
            >
              {this.state.translateButtonText}
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  async getPages() {
      return await ((await fetch(`main/GetPages`)).json());
  }
  
  async handleUrlInput(e) {
      await this.handleTextareaChange(e.target);
  }
  
  async handleTextareaChange(target) {
      this.setState({
          inputUrls: target.value,
          urlButtonDisabled: !target.value.length,
      });
      target.style.height = "1px";
      target.style.height = `${target.scrollHeight}px`;
      target.rows = 3;
  }
  
  async submitUrlInput() {
      const urls = this.state.inputUrls.split("\n");
      const urlTextarea = document.querySelector("#urlTextarea");
      const emailInput = document.querySelector("#email");
      urlTextarea.disabled = true;
      
      console.log("loading..");
      this.setState({
          popupDisplay: true,
          urlButtonDisabled: true,
          buttonText: "Loading..",
      });
      
      const json = await ((await fetch(`main/PostUrls`, {
          method: "POST",
          body: JSON.stringify(urls),
          headers: {
              'Content-Type': 'application/json',
          },
      })).json());
      urlTextarea.disabled = false;
      urlTextarea.value = "";
      await this.handleTextareaChange(urlTextarea);
      this.setState({
          inputUrls: "",
          characterCount: await ((await fetch(`main/GetCharacterCount`)).json()),
          urlButtonDisabled: false,
          buttonText: "Submit",
          popupContent: json,
          popupActive: true,
          popupUrlActive: true,
          popupTranslateActive: false,
          pages: await this.getPages(),
      });
      await this.addingDone(emailInput.value);
  }
  
  async addingDone(email) {
      if (email.length > 0) {
          await fetch(`main/AddingDone?email=${email}`);
      }
  }
  
  async hidePopup() {
      this.setState({
          popupActive: false,
      });
      setTimeout(() => {
          this.setState({
              popupDisplay: false,
              popupUrlActive: false,
              popupTranslateActive: false,
              popupContent: [],
          })
      }, 700);
  }
  
  async editPage(page) {
      loseFocus();
      this.setState({
          editedPage: page,
          editorValue: deserialize(page.Html),
          editorDisabled: false,
          saveButtonDisabled: true,
          translateButtonDisabled: page.Translated,
      });
  }
  
  async savePage() {
      this.setState({
          editorDisabled: true,
          saveButtonDisabled: true,
          saveButtonText: "Saving..",
          translateButtonDisabled: true,
      });
      const content = this.state.editedPage;
      content.Html = serialize(this.state.editorValue);
      content.Edited = true;
      content.Linked = /<a.+monitask.com.*>/.test(content.Html);
      await fetch(`main/UpdateRecord`, {
          method: "POST",
          body: JSON.stringify(content),
          headers: {
              'Content-Type': 'application/json',
          },
      });
      this.setState({
          editorDisabled: false,
          saveButtonText: "Save",
          translateButtonDisabled: content.Translated,
      });
  }

  async translatePage() {
      this.setState({
          editorDisabled: true,
          saveButtonDisabled: true,
          translateButtonText: "Translating..",
          translateButtonDisabled: true,
      });
      const content = this.state.editedPage;
      content.Html = serialize(this.state.editorValue);
      const json = await ((await fetch(`main/TranslateRecord`, {
          method: "POST",
          body: JSON.stringify(content),
          headers: {
              'Content-Type': 'application/json',
          },
      })).json());
      if (json.Error) {
          this.setState({
              popupContent: json.Text,
              popupActive: true,
              popupDisplay: true,
              popupUrlActive: false,
              popupTranslateActive: true,
              editorDisabled: false,
              saveButtonDisabled: false,
              translateButtonText: "Translate",
              translateButtonDisabled: false,
          });
          return;
      }
      this.state.editedPage.Html = json.Text;
      this.state.editedPage.Translated = true;
      this.setState({
          editorValue: deserialize(json.Text),
          editorDisabled: false,
          translateButtonText: "Translate",
      });
  }
}
