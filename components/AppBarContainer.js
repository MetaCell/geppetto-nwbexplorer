import { connect } from 'react-redux';
import Appbar from './AppBar';
import { unloadNWBFile, unloadNWBFileInNotebook } from '../actions/nwbfile';
import { enableInfoPanel, disableInfoPanel } from '../actions/general';
import { createNode, deleteAll } from '../actions/flexlayout';

const mapStateToProps = state => ({
  toggleInfoPanel: state.general.toggleInfoPanel,
  model: state.nwbfile.model
});

const mapDispatchToProps = dispatch => ({ 
  enableInfoPanel: () => dispatch(enableInfoPanel),
  disableInfoPanel: () => dispatch(disableInfoPanel),
  unloadNWBFile: () => {
    dispatch(unloadNWBFileInNotebook());
    dispatch(unloadNWBFile);
  },
  createNode: json => dispatch(createNode(json)),
  deleteAll: () => dispatch(deleteAll())
});

export default connect(mapStateToProps, mapDispatchToProps)(Appbar);