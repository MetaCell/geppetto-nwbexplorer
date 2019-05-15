import React from 'react';
import { connect } from "react-redux";
import { withStyles } from '@material-ui/core/styles';

import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

import { loadNWBFileAction } from '../actions/loadFileActions';

const styles = theme => ({ inputs: { margin: 2 } });

export class FileUrlSelector extends React.Component {

  constructor (props) {
    super(props);
    this.handleClickLoadFile = this.handleClickLoadFile.bind(this);

    this.state = { inputValue: '' };
  } 

  
  componentDidUpdate (prevProps, prevState) {
   
  }
  handleClickLoadFile () {
    this.props.loadNWBFileAction(this.state.inputValue);
  }

  updateInputValue (evt) {
    this.setState({ inputValue: evt.target.value });
  }
  render () {
    

    return (
      <div>
        <h2>What file do you wish to load?</h2>
        <div className="aligned-form-elements-wrapper">
          <TextField
            id="nwb-url-input"
            placeholder="Paste a NWB file URL"
            // helperText="Insert a public url or local absolute path of an NWB file"
            className = 'aligned-form-element input'
            variant="outlined"
            onChange={ evt => this.updateInputValue(evt) }
          />
          <Button
            id="load-file-button"
            variant="outlined"
            onClick={this.handleClickLoadFile}
            className = 'aligned-form-element button'
            disabled={this.state.inputValue.length <= 5}
          >Load NWB file</Button>
        </div>
      </div>
    );
  }

}

FileUrlSelector.defaultProps = {};

const mapStateToProps = state => ({});
const mapDispatchToProps = dispatch => ({ loadNWBFileAction: payload => dispatch(loadNWBFileAction(payload)) });

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(FileUrlSelector));


