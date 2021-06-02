import React, {Component} from 'react';
import {BsDownload, BsPen, BsTextareaT} from "react-icons/all";

import './contentTable.css';

export class ContentTable extends Component {
  
  constructor(props) {
      super(props);
      this.state = {
          equality: 0,
      }
  }
  
  async componentDidMount() {
      const configEquality = parseInt(await ((await fetch(`main/GetEquality`)).json()));
      this.setState({
          equality: configEquality,
      })
  }
    
  render() {
    return (
      <table className={"table-bordered"}>
        <thead>
          <tr>
            <th className={"urlCell"}>URL</th>
            <th className={"equalityCell"}>Equality</th>
            <th className={"buttonCell"}>Edit</th>
            <th className={"buttonCell"}>Translated</th>
            <th className={"buttonCell"}>Download</th>
          </tr>
        </thead>
        <tbody>
            {!this.props.pages.length ? 
            (
                <tr>
                  <td className={"tdPlaceholder"} colSpan={"100%"}>{this.props.loading ? "loading.." : "No pages in database"}</td>
                </tr>
            ) :
            this.props.pages.map(page => (
                <tr key={page.Id}>
                  <td className={"urlCell"}>{page.Url}</td>
                  <td className={`equalityCell ${page.Equality > this.state.equality ? "sufficient" : "insufficient"}`}>{page.Equality}</td>
                  <td className={"buttonCell"}>
                    <button className={"btn-light"} onClick={this.props.editPage.bind(this, page.Html)}><BsPen/></button>
                  </td>
                  <td className={"buttonCell"}>
                    <button className={"btn-light"} onClick={this.props.translatePage.bind(this, page.Html)}><BsTextareaT/></button>
                  </td>
                  <td className={"buttonCell"}>
                    <button className={"btn-light"} onClick={this.props.downloadDoc}><BsDownload/></button>
                  </td>
                </tr>
            ))}
        </tbody>
      </table>
    );
  }
}