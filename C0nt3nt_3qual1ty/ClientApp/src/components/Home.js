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
        <Popup active={this.state.popupActive} hidePopup={this.hidePopup.bind(this)}>
          {this.state.popupUrlActive && <PopupUrlContent content={this.state.popupContent}/>}
          {this.state.popupTranslateActive && <PopupTranslationContent content={this.state.popupContent}/>}
        </Popup>
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
          <button className={"btn-dark"} type={"submit"} onClick={this.submitUrlInput.bind(this)} disabled={this.state.urlButtonDisabled}>
              {this.state.buttonText}
          </button>
        </div>
        <div>
          <ContentTable
            pages={this.state.pages}
            loading={this.state.loading}
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
      return await ((await fetch(`main`)).json());
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
      urlTextarea.disabled = true;
      
      console.log("loading..");
      this.setState({
          urlButtonDisabled: true,
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
          urlButtonDisabled: false,
          buttonText: "Submit",
          popupContent: json,
          popupActive: true,
          popupUrlActive: true,
          popupTranslateActive: false,
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
      })
      const content = this.state.editedPage;
      content.Html = serialize(this.state.editorValue);
      const json = await ((await fetch(`main/UpdateRecord`, {
          method: "POST",
          body: JSON.stringify(content),
          headers: {
              'Content-Type': 'application/json',
          },
      })).json());
      this.setState({
          editorDisabled: false,
          saveButtonText: "Save",
          translateButtonDisabled: content.Translated,
      })
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
              popupUrlActive: false,
              popupTranslateActive: true,
              editorDisabled: false,
              saveButtonDisabled: false,
              translateButtonText: "Translate",
              translateButtonDisabled: false,
          });
          return;
      }
      this.state.editedPage.Translated = true;
      this.setState({
          editorValue: deserialize(json.Text),
          editorDisabled: false,
          translateButtonText: "Translate",
      });
  }
}
