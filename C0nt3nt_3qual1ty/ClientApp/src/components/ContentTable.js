import React, {Component} from 'react';
import {BsDownload, BsPen, BsCheck} from "react-icons/all";

import './contentTable.css';

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
      })
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
                  <tr className={this.props.editedPageId === page.Id ? "highlighted" : ""} key={page.Id}>
                    <td className={"idCell"}>{page.Id}</td>
                    <td className={"urlCell"}>{page.Url}</td>
                    <td className={`uniquenessCell ${page.Uniqueness > this.state.uniqueness ? "sufficient" : "insufficient"}`}>{page.Uniqueness}</td>
                    <td className={"buttonCell"}>
                      <button className={"btn-light"} onClick={this.props.editPage.bind(this, page)}><BsPen/></button>
                    </td>
                    <td className={"buttonCell"}>
                      {page.Translated ? <BsCheck/> : ""}
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
}