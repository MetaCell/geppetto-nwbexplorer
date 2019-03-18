import React from 'react';
import {
  execPythonMessage, 
  evalPythonMessage
} from 'geppetto-client/js/communication/geppettoJupyter/GeppettoJupyterUtils';


const Utils = {

  getHTMLType: function (type) {

    let htmlType;
    switch (type) {
    case "int":
      htmlType = "number";
      break;
    default:
      htmlType = "text";
      break;
    }
    return htmlType;

  },
 
  isObject: function (item) {
    return (item && typeof item === 'object' && !Array.isArray(item));
  },
    
  // FIXME: Hack to remove scaped chars (\\ -> \ and \' -> ') manually
  convertToJSON (data){
    if (typeof data === 'string' || data instanceof String){
      return JSON.parse(data.replace(/\\\\/g, '\\').replace(/\\'/g, '\''))
    }
    return data
  },

  getErrorResponse (data){
    let parsedData = this.convertToJSON(data)
    if (parsedData.hasOwnProperty("type") && parsedData['type'] == 'ERROR'){
      return { 'message': parsedData['message'], 'details' : parsedData['details'] }
    }
    return null;
  },

  parsePythonException (exception){
    return <pre dangerouslySetInnerHTML={{ __html: IPython.utils.fixConsole(exception) }} />
  },
  isNotebookLoaded () {
    return window.IPython != undefined;
  },

  execPythonMessage,
  evalPythonMessage
}

export default Utils