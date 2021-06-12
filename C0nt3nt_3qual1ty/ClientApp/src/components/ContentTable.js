import React, {Component} from 'react';
import {BsCheck, BsDownload, BsPen} from "react-icons/all";

import './contentTable.css';

import linq from "linq";

export class ContentTable extends Component {
  
  constructor(props) {
      super(props);
      this.state = {
          uniqueness: 0,
      }
  }
  
  async componentDidMount() {
      const configUniqueness = parseInt(await ((await fetch(`main/GetUniqueness`)).json()));
      this.setState({
          uniqueness: configUniqueness,
      });
  }
    
  render() {
    return (
      <div className={"tableContainer"}>
        <table className={"table-bordered table-striped"}>
          <thead>
            <tr>
              <th className={"idCell"}>Id</th>
              <th className={"urlCell"}>URL</th>
              <th className={"uniquenessCell"}>Uniqueness</th>
              <th className={"buttonCell"}>Edit</th>
              <th className={"buttonCell"}>Edited</th>
              <th className={"buttonCell"}>Linked</th>
              <th className={"buttonCell"}>Translated</th>
              <th className={"buttonCell"}>Done</th>
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
              linq.from(this.props.pages)
                  .orderBy(p => p.Done)
                  .thenBy(p => p.Id)
                  .toArray()
                  .map(page => (
                  <tr id={page.Id} className={`${page.Done ? "done" : ""} ${this.props.editedPageId === page.Id ? "highlighted" : ""}`} key={page.Id}>
                    <td className={"idCell"}>{page.Id}</td>
                    <td className={"urlCell"}>{page.Url}</td>
                    <td className={`uniquenessCell ${page.Uniqueness > this.state.uniqueness ? "sufficient" : "insufficient"}`}>{page.Uniqueness}</td>
                    <td className={"buttonCell"}>
                      <button disabled={page.Done} className={"btn-light"} onClick={this.props.editPage.bind(this, page)}><BsPen/></button>
                    </td>
                    <td className={"buttonCell"}>
                      {page.Edited ? <BsCheck/> : ""}
                    </td>
                    <td className={"buttonCell"}>
                      {page.Linked ? <BsCheck/> : ""}
                    </td>
                    <td className={"buttonCell"}>
                      {page.Translated ? <BsCheck/> : ""}
                    </td>
                    <td className={"buttonCell"}>
                      <input type={"checkbox"} checked={page.Done} onChange={e => this.handleCheckboxChange(e, page)}/>
                    </td>
                    <td className={"buttonCell"}>
                      <a 
                        download={`${page.Id}.html`}
                        className={"btn-light downloadButton"}
                        href={`main/DownloadHtml?id=${page.Id}`}
                      >
                        <BsDownload/>
                      </a>
                    </td>
                  </tr>
              ))}
          </tbody>
        </table>
      </div>
    );
  }
  
  handleCheckboxChange(e, page) {
      page.Done = e.target.checked;
      fetch(`main/UpdateRecord`, {
          method: "POST",
          body: JSON.stringify(page),
          headers: {
              'Content-Type': 'application/json',
          },
      });
      this.props.resetPages(this.props.pages);
  }
}